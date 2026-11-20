import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import Modal from './Modal';

interface PrankModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrankModal({ open, onClose }: PrankModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playMessage, setPlayMessage] = useState('');
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoLoadMessage, setVideoLoadMessage] = useState('');
  const [videoFallback, setVideoFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let objectUrl: string | null = null;

    fetch('/videos/cat-laughing-at-you.mp4', {
      cache: 'force-cache',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
        return response.blob();
      })
      .then((videoBlob) => {
        const url = URL.createObjectURL(videoBlob);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setVideoSrc(objectUrl);
      })
      .catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return;
        setVideoLoadMessage('Không tải trước được video; sẽ tải khi mở popup.');
        setVideoSrc('/videos/cat-laughing-at-you.mp4');
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  useEffect(() => {
    if (!open || !videoSrc) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    setPlayMessage('');
    video.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setPlayMessage('Trình duyệt chặn tự phát có tiếng. Bấm nút bên dưới để phát.');
        return;
      }
      setPlayMessage('Không thể tự phát video. Hãy thử bấm nút phát.');
    });
  }, [open, videoSrc]);

  const playWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.play().then(
      () => setPlayMessage(''),
      () => setPlayMessage('Không thể phát video. Hãy thử nút phát trên video.')
    );
  };

  return (
    <>
      <Modal
        className="prank-modal"
        open={open}
        title="Không có đâu"
        onClose={onClose}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>Đóng</Button>
            <a
              className="btn btn-primary btn-md"
              href="https://www.youtube.com/watch?v=L8XbI9aJOXk"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                onClose();
                setFollowUpOpen(true);
              }}
            >
              Thử lại
            </a>
          </>
        }
      >
        <div className="prank-modal-content">
          <p>Thật ra có 1% nhận được.</p>
          {videoSrc ? (
            videoFallback ? (
              <>
                <p className="prank-video-loading">Video cục bộ không tải được; đang dùng video dự phòng.</p>
                <iframe
                  className="prank-video-frame"
                  src="https://www.youtube-nocookie.com/embed/L8XbI9aJOXk?autoplay=1&playsinline=1"
                  title="Video dự phòng"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </>
            ) : (
              <video
                ref={videoRef}
                className="prank-video"
                src={videoSrc}
                autoPlay
                controls
                playsInline
                preload="auto"
                onError={() => setVideoFallback(true)}
              >
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            )
          ) : (
            <p className="prank-video-loading">Đang chuẩn bị video…</p>
          )}
          {videoLoadMessage && <p className="prank-video-loading">{videoLoadMessage}</p>}
          {playMessage && !videoFallback && (
            <div className="prank-video-prompt">
              <p>{playMessage}</p>
              <Button onClick={playWithSound}>Phát video có tiếng</Button>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        className="follow-up-modal"
        open={followUpOpen}
        title="Tin thật à?"
        onClose={() => setFollowUpOpen(false)}
      >
        <button
          className="follow-up-close"
          type="button"
          aria-label="Đóng"
          onClick={() => setFollowUpOpen(false)}
        >
          ×
        </button>
      </Modal>
    </>
  );
}
