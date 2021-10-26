import { shallowMount } from '@vue/test-utils';
import OptionHeader from '@/components/OptionHeader.vue';

describe('OptionHeader.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message';
    const wrapper = shallowMount(OptionHeader, {
      props: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
