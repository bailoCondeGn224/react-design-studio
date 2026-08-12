import L from 'leaflet';

export interface MapFollower {
  followTo(target: [number, number]): void;
  recenterOn(target: [number, number]): void;
  isFollowing(): boolean;
  onChange(listener: (following: boolean) => void): void;
  runProgrammatic(action: () => void): void;
  destroy(): void;
}

export const createMapFollower = (map: L.Map): MapFollower => {
  let following = true;
  let programmatic = false;
  const listeners: ((following: boolean) => void)[] = [];

  const notify = () => listeners.forEach((listener) => listener(following));

  const stopFollowing = () => {
    if (programmatic || !following) return;
    following = false;
    notify();
  };

  const runProgrammatic = (action: () => void) => {
    programmatic = true;
    action();
    map.once('moveend', () => {
      programmatic = false;
    });
    window.setTimeout(() => {
      programmatic = false;
    }, 1200);
  };

  map.on('dragstart', stopFollowing);
  map.on('zoomstart', stopFollowing);

  return {
    followTo(target) {
      if (!following) return;
      runProgrammatic(() => map.panTo(target, { animate: true, duration: 0.8 }));
    },

    recenterOn(target) {
      following = true;
      notify();
      runProgrammatic(() => map.panTo(target, { animate: true, duration: 0.6 }));
    },

    isFollowing: () => following,

    onChange(listener) {
      listeners.push(listener);
    },

    runProgrammatic,

    destroy() {
      map.off('dragstart', stopFollowing);
      map.off('zoomstart', stopFollowing);
      listeners.length = 0;
    },
  };
};
