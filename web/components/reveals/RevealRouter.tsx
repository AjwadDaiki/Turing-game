import { RevealedAnswer, EpreuveInputType } from '@/lib/clientTypes';
import TextReveal from './TextReveal';
import EmojiReveal from './EmojiReveal';
import ColorReveal from './ColorReveal';
import SliderReveal from './SliderReveal';
import NumberReveal from './NumberReveal';
import DrawReveal from './DrawReveal';
import SwipeReveal from './SwipeReveal';
import ListReveal from './ListReveal';

interface Props {
  answer: RevealedAnswer;
  inputType: EpreuveInputType;
  compact?: boolean;
}

export default function RevealRouter({ answer, inputType, compact }: Props) {
  switch (inputType) {
    case 'text':   return <TextReveal answer={answer} compact={compact} />;
    case 'emoji':  return <EmojiReveal answer={answer} compact={compact} />;
    case 'color':  return <ColorReveal answer={answer} compact={compact} />;
    case 'slider': return <SliderReveal answer={answer} compact={compact} />;
    case 'number': return <NumberReveal answer={answer} compact={compact} />;
    case 'draw':   return <DrawReveal answer={answer} compact={compact} />;
    case 'swipe':  return <SwipeReveal answer={answer} compact={compact} />;
    case 'list':   return <ListReveal answer={answer} compact={compact} />;
    default:       return <TextReveal answer={answer} compact={compact} />;
  }
}
