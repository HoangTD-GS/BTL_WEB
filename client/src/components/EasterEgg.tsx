import { useEffect, useState } from 'react';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface EasterEggProps {
  enabled: boolean;
  claimCount: number;
  canHide: boolean;
  onClaim: () => void;
  onHide: () => void;
}

interface Egg {
  id: number;
  left: number;
}

const LOCAL_EGG_ICON = '/images/easter-egg.png';
const FLATICON_EGG_ICON = 'https://cdn-icons-png.flaticon.com/512/2663/2663213.png';

export default function EasterEgg({ enabled, claimCount, canHide, onClaim, onHide }: EasterEggProps) {
  const [egg, setEgg] = useState<Egg | null>(null);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [eggImage, setEggImage] = useState(LOCAL_EGG_ICON);
  const [emojiFallback, setEmojiFallback] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setEgg(null);
      setRewardOpen(false);
      return;
    }
    const timer = window.setInterval(() => {
      setEggImage(LOCAL_EGG_ICON);
      setEmojiFallback(false);
      setEgg({
        id: Date.now(),
        left: 8 + Math.random() * 84,
      });
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  const claim = () => {
    setEgg(null);
    setRewardOpen(false);
    onClaim();
  };

  const hide = () => {
    setEgg(null);
    setRewardOpen(false);
    onHide();
  };

  return (
    <>
      {enabled && egg && (
        <button
          key={egg.id}
          type="button"
          className="floating-easter-egg"
          style={{ left: `${egg.left}%` }}
          aria-label="Mở trứng Easter egg"
          title="Bạn tìm thấy một quả trứng!"
          onClick={() => {
            setEgg(null);
            setRewardOpen(true);
          }}
          onAnimationEnd={() => setEgg(null)}
        >
          {emojiFallback ? (
            <span aria-hidden="true">🥚</span>
          ) : (
            <img
              src={eggImage}
              alt=""
              draggable={false}
              onError={() => {
                if (eggImage === LOCAL_EGG_ICON) setEggImage(FLATICON_EGG_ICON);
                else setEmojiFallback(true);
              }}
            />
          )}
        </button>
      )}
      <Modal
        className="easter-egg-modal"
        open={enabled && rewardOpen}
        title="Chúc mừng!"
        onClose={() => setRewardOpen(false)}
        footer={
          <>
            {canHide && claimCount > 0 && (
              <Button variant="secondary" onClick={hide}>
                Không hiện lại nữa
              </Button>
            )}
            <Button onClick={claim}>Nhận free role admin</Button>
          </>
        }
      >
        <p>Bạn nhận được free role admin!</p>
      </Modal>
    </>
  );
}
