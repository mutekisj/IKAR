
import json
import queue
import time
from pathlib import Path

import sounddevice as sd
from vosk import Model, KaldiRecognizer


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "models" / "vosk-model-small-ru-0.22"

audio_queue = queue.Queue()

COMMAND_TIMEOUT = 12


def audio_callback(indata, frames, time_info, status):
    """Получает аудио с микрофона."""

    if status:
        print("Ошибка аудио:", status)

    audio_queue.put(bytes(indata))


def is_wake_word(text: str) -> bool:
    """Проверяет наличие ключевого слова."""

    words = text.lower().split()

    return "икар" in words


def clear_audio_queue():
    """Очищает очередь накопленных аудиоданных."""

    while not audio_queue.empty():
        try:
            audio_queue.get_nowait()
        except queue.Empty:
            break


def start_listening():
    """Постоянно слушает микрофон и ожидает активацию."""

    if not MODEL_PATH.exists():
        print("Ошибка: модель Vosk не найдена!")
        return

    print("Загружаю модель распознавания...")

    # Относительный путь важен для корректной загрузки модели в Windows
    model = Model("models/vosk-model-small-ru-0.22")

    device_info = sd.query_devices(kind="input")
    sample_rate = int(device_info["default_samplerate"])

    recognizer = KaldiRecognizer(model, sample_rate)

    print(f"Микрофон: {device_info['name']}")
    print("\nИКАР запущен.")
    print("Скажи «Икар», чтобы активировать помощника.")
    print("Для выхода нажми Ctrl+C.\n")

    is_active = False
    command_deadline = 0

    try:
        with sd.RawInputStream(
            samplerate=sample_rate,
            blocksize=8000,
            dtype="int16",
            channels=1,
            callback=audio_callback
        ):

            while True:
                data = audio_queue.get()

                # Проверяем, не истекло ли время ожидания команды
                if is_active and time.monotonic() > command_deadline:
                    print("Время ожидания команды истекло.")
                    print("ИКАР снова слушает...\n")

                    is_active = False
                    recognizer.Reset()
                    continue

                if recognizer.AcceptWaveform(data):
                    result = json.loads(recognizer.Result())
                    recognized_text = result.get("text", "").strip()

                    if not recognized_text:
                        continue

                    # Режим ожидания ключевого слова
                    if not is_active:

                        if is_wake_word(recognized_text):
                            print("\nИКАР: Слушаю вас.")

                            is_active = True
                            command_deadline = (
                                time.monotonic() + COMMAND_TIMEOUT
                            )

                            recognizer.Reset()
                            clear_audio_queue()

                    # Режим ожидания команды
                    else:
                        print(f"Распознана команда: {recognized_text}")

                        print("\nИКАР: Команда получена.")
                        print("ИКАР снова слушает...\n")

                        is_active = False
                        recognizer.Reset()

    except KeyboardInterrupt:
        print("\nИКАР завершил работу.")
