import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultItem from '@/components/ResultItem.vue'
import type { CrossrefWork } from '@/types/crossref'

const mockWork: CrossrefWork = {
  DOI: '10.1234/test',
  title: ['Test Publication Title'],
  type: 'journal-article',
  author: [{ given: 'Jane', family: 'Smith' }],
  'container-title': ['Test Journal'],
  published: { 'date-parts': [[2024]] },
  score: 10
}

describe('ResultItem', () => {
  it('renders the title text', () => {
    const wrapper = mount(ResultItem, {
      props: { work: mockWork }
    })

    expect(wrapper.text()).toContain('Test Publication Title')
  })

  it('renders the DOI link with correct href', () => {
    const wrapper = mount(ResultItem, {
      props: { work: mockWork }
    })

    const doiLink = wrapper.find('a[href*="doi.org"]')
    expect(doiLink.exists()).toBe(true)
    expect(doiLink.attributes('href')).toBe('https://doi.org/10.1234/test')
  })

  it('renders author information', () => {
    const wrapper = mount(ResultItem, {
      props: { work: mockWork }
    })

    expect(wrapper.text()).toContain('Jane Smith')
  })

  it('renders publication type', () => {
    const wrapper = mount(ResultItem, {
      props: { work: mockWork }
    })

    expect(wrapper.text()).toContain('journal-article')
  })

  it('renders container title when present', () => {
    const wrapper = mount(ResultItem, {
      props: { work: mockWork }
    })

    expect(wrapper.text()).toContain('Test Journal')
  })

  it('handles missing authors gracefully', () => {
    const workWithoutAuthors = { ...mockWork, author: undefined }

    const wrapper = mount(ResultItem, {
      props: { work: workWithoutAuthors }
    })

    // Should not crash and should not show authors section
    expect(wrapper.text()).not.toContain('Authors:')
  })
})