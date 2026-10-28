"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Video } from "@/lib/content";

/** Autoplaying muted loop with a "Sound on" toggle that restarts the clip with audio. */
export function SoundVideo({ src, poster, label, children }: { src: string; poster?: string; label: string; children?: ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Don't download/play the (large) clip until it's near the screen; pause it when scrolled away.
  useEffect(() => {
    const v = ref.current;
    if (!v || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en?.isIntersecting) {
          if (v.preload !== "auto") v.preload = "auto";
          void v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.pause();
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    if (!next) {
      v.currentTime = 0;
      void v.play();
    }
    setMuted(next);
  };

  return (
    <>
      <video ref={ref} muted loop playsInline preload="none" poster={poster} aria-label={label}>
        <source src={src} type="video/mp4" />
      </video>
      <button className="sound-btn" type="button" onClick={toggle} aria-pressed={!muted}>
        <Icon name={muted ? "sound" : "mute"} />
        <span>{muted ? "Sound on" : "Mute"}</span>
      </button>
      {children}
    </>
  );
}

/** Vertical build-tour reels. Only one plays at a time. */
export function VideoReels({ videos }: { videos: Video[] }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);

  const play = (i: number) => {
    refs.current.forEach((v, k) => k !== i && v?.pause());
    const v = refs.current[i];
    if (!v) return;
    v.controls = true;
    void v.play();
    setPlaying(i);
  };

  return (
    <div className="reels">
      {videos.map((v, i) => (
        <figure key={v.src} className="reel reveal">
          <video
            ref={(el) => {
              refs.current[i] = el;
            }}
            src={v.src}
            poster={v.poster}
            playsInline
            preload="none"
            onEnded={(e) => {
              e.currentTarget.controls = false;
              setPlaying((p) => (p === i ? null : p));
            }}
          />
          {playing !== i && (
            <button className="play" type="button" aria-label={`Play ${v.title}`} onClick={() => play(i)}>
              <Icon name="play" />
            </button>
          )}
          <figcaption>
            <h3>{v.title}</h3>
            {v.text && <p>{v.text}</p>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
