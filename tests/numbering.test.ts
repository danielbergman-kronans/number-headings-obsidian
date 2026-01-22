import { Editor, EditorChange, EditorRange, HeadingCache } from 'obsidian'
import { DEFAULT_SETTINGS, NumberHeadingsPluginSettings } from '../src/settingsTypes'
import { ViewInfo } from '../src/activeViewHelpers'
import { updateHeadingNumbering } from '../src/numbering'

// Helper to create a mock heading
function createHeading(level: number, text: string, line: number): HeadingCache {
  return {
    level,
    heading: text,
    position: {
      start: { line, col: 0 },
      end: { line, col: text.length }
    }
  } as HeadingCache
}

// Helper to create mock Editor that tracks changes
function createMockEditor(lines: string[]): { editor: Editor; changes: EditorChange[] } {
  const changes: EditorChange[] = []

  const editor = {
    getLine: (line: number) => lines[line] || undefined,
    getRange: (from: EditorRange['from'], to: EditorRange['to']) => {
      const lineText = lines[from.line]
      if (!lineText) return ''
      return lineText.substring(from.ch, to.ch)
    },
    transaction: (transaction: { changes: EditorChange[] }) => {
      changes.push(...transaction.changes)
    },
    lastLine: () => Math.max(0, lines.length - 1)
  } as Editor

  return { editor, changes }
}

// Helper to create mock ViewInfo
function createMockViewInfo(headings: HeadingCache[], lines: string[]): { viewInfo: ViewInfo; changes: EditorChange[] } {
  const { editor, changes } = createMockEditor(lines)

  const viewInfo: ViewInfo = {
    activeView: {} as any,
    data: {
      headings
    } as any,
    editor
  }

  return { viewInfo, changes }
}

describe('updateHeadingNumbering - maxLevel setting', () => {
  let settings: NumberHeadingsPluginSettings

  beforeEach(() => {
    settings = { ...DEFAULT_SETTINGS }
    settings.styleLevel1 = '1'
    settings.styleLevelOther = '1'
    settings.separator = '.'
    settings.maxLevel = 3
    settings.firstLevel = 1
    settings.skipTopLevel = false
  })

  test('headings above maxLevel should be skipped', () => {
    const headings = [
      createHeading(1, 'Heading 1', 0),
      createHeading(2, 'Heading 2', 1),
      createHeading(4, 'Heading 4 (above max)', 2), // Level 4 > maxLevel 3
      createHeading(2, 'Heading 2 again', 3)
    ]

    const lines = [
      '# Heading 1',
      '## Heading 2',
      '#### Heading 4 (above max)',
      '## Heading 2 again'
    ]

    const { viewInfo, changes } = createMockViewInfo(headings, lines)

    updateHeadingNumbering(viewInfo, settings)

    // Should have 3 changes (heading 1, heading 2, heading 2 again)
    // Heading 4 should be skipped
    expect(changes.length).toBe(3)

    // Check that heading 4 was not numbered
    const heading4Change = changes.find(c => c.from.line === 2)
    expect(heading4Change).toBeUndefined()

    // Check that heading 2 again is numbered correctly (should be 1.2, not affected by heading 4)
    const heading2AgainChange = changes.find(c => c.from.line === 3)
    expect(heading2AgainChange).toBeDefined()
    expect(heading2AgainChange?.text).toContain('1.2')
  })

  test('headings at maxLevel should be numbered', () => {
    const headings = [
      createHeading(1, 'Heading 1', 0),
      createHeading(2, 'Heading 2', 1),
      createHeading(3, 'Heading 3 (at max)', 2), // Level 3 = maxLevel 3
      createHeading(4, 'Heading 4 (above max)', 3) // Level 4 > maxLevel 3
    ]

    const lines = [
      '# Heading 1',
      '## Heading 2',
      '### Heading 3 (at max)',
      '#### Heading 4 (above max)'
    ]

    const { viewInfo, changes } = createMockViewInfo(headings, lines)

    updateHeadingNumbering(viewInfo, settings)

    // Should have 3 changes (heading 1, heading 2, heading 3)
    // Heading 4 should be skipped
    expect(changes.length).toBe(3)

    // Check that heading 3 was numbered
    const heading3Change = changes.find(c => c.from.line === 2)
    expect(heading3Change).toBeDefined()
    expect(heading3Change?.text).toContain('1.1.1')

    // Check that heading 4 was not numbered
    const heading4Change = changes.find(c => c.from.line === 3)
    expect(heading4Change).toBeUndefined()
  })

  test('numbering should continue correctly after skipping headings above maxLevel', () => {
    const headings = [
      createHeading(1, 'Heading 1', 0),
      createHeading(2, 'Heading 2', 1),
      createHeading(5, 'Heading 5 (above max)', 2), // Level 5 > maxLevel 3
      createHeading(6, 'Heading 6 (above max)', 3), // Level 6 > maxLevel 3
      createHeading(2, 'Heading 2 again', 4),
      createHeading(3, 'Heading 3', 5)
    ]

    const lines = [
      '# Heading 1',
      '## Heading 2',
      '##### Heading 5 (above max)',
      '###### Heading 6 (above max)',
      '## Heading 2 again',
      '### Heading 3'
    ]

    const { viewInfo, changes } = createMockViewInfo(headings, lines)

    updateHeadingNumbering(viewInfo, settings)

    // Should have 4 changes (heading 1, heading 2, heading 2 again, heading 3)
    // Headings 5 and 6 should be skipped
    expect(changes.length).toBe(4)

    // Check that heading 2 again is numbered as 1.2 (next heading 2, not affected by skipped headings)
    const heading2AgainChange = changes.find(c => c.from.line === 4)
    expect(heading2AgainChange).toBeDefined()
    expect(heading2AgainChange?.text).toContain('1.2')

    // Check that heading 3 is numbered as 1.2.1 (child of heading 2 again)
    const heading3Change = changes.find(c => c.from.line === 5)
    expect(heading3Change).toBeDefined()
    expect(heading3Change?.text).toContain('1.2.1')
  })

  test('headings above maxLevel should not affect numbering stack', () => {
    const headings = [
      createHeading(1, 'Heading 1', 0),
      createHeading(2, 'Heading 2', 1),
      createHeading(4, 'Heading 4 (above max)', 2), // Level 4 > maxLevel 3
      createHeading(3, 'Heading 3', 3) // Should be numbered as child of heading 2
    ]

    const lines = [
      '# Heading 1',
      '## Heading 2',
      '#### Heading 4 (above max)',
      '### Heading 3'
    ]

    const { viewInfo, changes } = createMockViewInfo(headings, lines)

    updateHeadingNumbering(viewInfo, settings)

    // Should have 3 changes
    expect(changes.length).toBe(3)

    // Check that heading 3 is numbered as 1.1.1 (child of heading 2, not affected by heading 4)
    const heading3Change = changes.find(c => c.from.line === 3)
    expect(heading3Change).toBeDefined()
    expect(heading3Change?.text).toContain('1.1.1')
  })

  test('multiple headings above maxLevel in sequence should all be skipped', () => {
    const headings = [
      createHeading(1, 'Heading 1', 0),
      createHeading(4, 'Heading 4 (above max)', 1), // Level 4 > maxLevel 3
      createHeading(5, 'Heading 5 (above max)', 2), // Level 5 > maxLevel 3
      createHeading(6, 'Heading 6 (above max)', 3), // Level 6 > maxLevel 3
      createHeading(2, 'Heading 2', 4)
    ]

    const lines = [
      '# Heading 1',
      '#### Heading 4 (above max)',
      '##### Heading 5 (above max)',
      '###### Heading 6 (above max)',
      '## Heading 2'
    ]

    const { viewInfo, changes } = createMockViewInfo(headings, lines)

    updateHeadingNumbering(viewInfo, settings)

    // Should have 2 changes (heading 1, heading 2)
    // All headings 4, 5, 6 should be skipped
    expect(changes.length).toBe(2)

    // Check that heading 2 is numbered as 1.1 (child of heading 1)
    const heading2Change = changes.find(c => c.from.line === 4)
    expect(heading2Change).toBeDefined()
    expect(heading2Change?.text).toContain('1.1')
  })

  test('maxLevel of 1 should only number level 1 headings', () => {
    settings.maxLevel = 1

    const headings = [
      createHeading(1, 'Heading 1', 0),
      createHeading(2, 'Heading 2', 1), // Should be skipped
      createHeading(3, 'Heading 3', 2), // Should be skipped
      createHeading(1, 'Heading 1 again', 3)
    ]

    const lines = [
      '# Heading 1',
      '## Heading 2',
      '### Heading 3',
      '# Heading 1 again'
    ]

    const { viewInfo, changes } = createMockViewInfo(headings, lines)

    updateHeadingNumbering(viewInfo, settings)

    // Should have 2 changes (both heading 1s)
    expect(changes.length).toBe(2)

    // Check that first heading 1 is numbered as 1
    const heading1Change = changes.find(c => c.from.line === 0)
    expect(heading1Change).toBeDefined()
    expect(heading1Change?.text).toContain('1.')

    // Check that second heading 1 is numbered as 2
    const heading1AgainChange = changes.find(c => c.from.line === 3)
    expect(heading1AgainChange).toBeDefined()
    expect(heading1AgainChange?.text).toContain('2.')
  })

  test('maxLevel of 6 should number all headings', () => {
    settings.maxLevel = 6

    const headings = [
      createHeading(1, 'Heading 1', 0),
      createHeading(2, 'Heading 2', 1),
      createHeading(3, 'Heading 3', 2),
      createHeading(4, 'Heading 4', 3),
      createHeading(5, 'Heading 5', 4),
      createHeading(6, 'Heading 6', 5)
    ]

    const lines = [
      '# Heading 1',
      '## Heading 2',
      '### Heading 3',
      '#### Heading 4',
      '##### Heading 5',
      '###### Heading 6'
    ]

    const { viewInfo, changes } = createMockViewInfo(headings, lines)

    updateHeadingNumbering(viewInfo, settings)

    // Should have 6 changes (all headings)
    expect(changes.length).toBe(6)

    // Check that heading 6 was numbered
    const heading6Change = changes.find(c => c.from.line === 5)
    expect(heading6Change).toBeDefined()
    expect(heading6Change?.text).toContain('1.1.1.1.1.1')
  })

  test('headings above maxLevel should not update previousLevel', () => {
    const headings = [
      createHeading(2, 'Heading 2', 0),
      createHeading(4, 'Heading 4 (above max)', 1), // Level 4 > maxLevel 3
      createHeading(2, 'Heading 2 again', 2) // Should be numbered as sibling of first heading 2
    ]

    const lines = [
      '## Heading 2',
      '#### Heading 4 (above max)',
      '## Heading 2 again'
    ]

    const { viewInfo, changes } = createMockViewInfo(headings, lines)

    updateHeadingNumbering(viewInfo, settings)

    // Should have 2 changes
    expect(changes.length).toBe(2)

    // Check that first heading 2 is numbered (starts at 0.1 because firstLevel=1 and we start at level 2)
    const heading2Change = changes.find(c => c.from.line === 0)
    expect(heading2Change).toBeDefined()
    expect(heading2Change?.text).toContain('0.1')

    // Check that second heading 2 is numbered as 0.2 (sibling, not affected by heading 4)
    const heading2AgainChange = changes.find(c => c.from.line === 2)
    expect(heading2AgainChange).toBeDefined()
    expect(heading2AgainChange?.text).toContain('0.2')
  })
})
