
import { Activity, Mic, Radio, Sparkles } from "lucide-react";

export default function AssistantPanel() {
  return (
    <section className="content-card assistant-panel">
      <div className="assistant-heading">
        <div>
          <span className="eyebrow">INTELLIGENT ASSISTANT</span>
          <h2>ИКАР</h2>
        </div>

        <div className="assistant-status">
          <span />
          Интерфейс активен
        </div>
      </div>

      <div className="assistant-visual">
        <div className="assistant-orbit orbit-one" />
        <div className="assistant-orbit orbit-two" />

        <div className="assistant-core">
          <Sparkles size={34} />
        </div>
      </div>

      <div className="assistant-description">
        <strong>Твой персональный помощник</strong>
        <span>
          Управляй задачами голосом и получай напоминания вовремя.
        </span>
      </div>

      <div className="assistant-footer">
        <div>
          <Activity size={15} />
          <span>Готов к подключению</span>
        </div>

        <div>
          <Radio size={15} />
          <span>Desktop-модуль</span>
        </div>
      </div>

      <button className="assistant-button" disabled>
        <Mic size={17} />
        Голосовой модуль скоро появится
      </button>
    </section>
  );
}
