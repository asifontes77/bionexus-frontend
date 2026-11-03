import { readFileSync } from 'node:fs'

describe('BioNexusDialog native scroll contract', () => {
  const source = readFileSync('src/components/ui/BioNexusDialog.vue', 'utf8')

  it('keeps the native dialog fixed and the body as the only intended scroll container', () => {
    expect(source).toContain('@scroll="resetNativeDialogScroll"')
    expect(source).toContain('nativeDialog.scrollTop = 0')
    expect(source).toContain('nativeDialog.scrollLeft = 0')
    expect(source).toContain('NATIVE_DIALOG_SCROLL_GUARD_BEGIN')
    expect(source).not.toMatch(/<main[^>]+@scroll="resetNativeDialogScroll"/s)
  })
})
