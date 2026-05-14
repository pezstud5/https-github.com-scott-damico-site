import type { GameSnapshot, UpgradeOption } from '../../game/simulation/types';

type GameHudProps = {
  snapshot: GameSnapshot | null;
  upgrades: UpgradeOption[];
  onChooseUpgrade: (upgradeId: string) => void;
  onRestart: () => void;
};

export function GameHud({ snapshot, upgrades, onChooseUpgrade, onRestart }: GameHudProps) {
  const hpPercent = snapshot ? Math.max(0, (snapshot.hp / snapshot.maxHp) * 100) : 100;
  const salvagePercent = snapshot
    ? Math.min(100, (snapshot.salvage / snapshot.nextLevelAt) * 100)
    : 0;

  return (
    <div className="hud" aria-live="polite">
      <div className="hud-top">
        <div className="brand-lockup">
          <span className="eyebrow">Prototype</span>
          <h1>Neon Salvage</h1>
        </div>

        <div className="stat-row">
          <Meter label="Hull" value={`${Math.ceil(snapshot?.hp ?? 0)}/${snapshot?.maxHp ?? 100}`} percent={hpPercent} />
          <Meter label="Salvage" value={`${snapshot?.salvage ?? 0}/${snapshot?.nextLevelAt ?? 8}`} percent={salvagePercent} />
          <Stat label="Wave" value={snapshot?.wave ?? 1} />
          <Stat label="Score" value={snapshot?.score ?? 0} />
        </div>
      </div>

      <div className="hud-bottom">
        <div className="objective-panel">
          <span>{formatTime(snapshot?.elapsed ?? 0)}</span>
          <p>{snapshot?.message ?? 'Booting drone systems.'}</p>
        </div>

        <div className="control-strip">
          <kbd>WASD</kbd>
          <span>Move</span>
          <kbd>Space</kbd>
          <span>Dash</span>
          <kbd>R</kbd>
          <span>Restart</span>
        </div>
      </div>

      {snapshot?.phase === 'upgrade' ? (
        <div className="modal-backdrop">
          <div className="upgrade-panel" role="dialog" aria-modal="true" aria-label="Choose upgrade">
            <span className="eyebrow">Level {snapshot.level}</span>
            <h2>Install one module</h2>
            <div className="upgrade-grid">
              {upgrades.map((upgrade) => (
                <button key={upgrade.id} type="button" onClick={() => onChooseUpgrade(upgrade.id)}>
                  <strong>{upgrade.title}</strong>
                  <span>{upgrade.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {snapshot?.phase === 'gameover' ? (
        <div className="modal-backdrop">
          <div className="upgrade-panel" role="dialog" aria-modal="true" aria-label="Run complete">
            <span className="eyebrow">Run Complete</span>
            <h2>Drone offline</h2>
            <p className="summary-copy">
              Score {snapshot.score}. Salvage {snapshot.salvage}. Survival time {formatTime(snapshot.elapsed)}.
            </p>
            <button className="restart-button" type="button" onClick={onRestart}>
              Reboot run
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Meter({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="meter-track">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
