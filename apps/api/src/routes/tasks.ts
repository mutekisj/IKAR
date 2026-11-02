import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

// Получить все задачи

router.get("/", async (req, res) => {
  try {
    const status = req.query.status;

    let query = "SELECT * FROM tasks";
    const values: string[] = [];

    if (status === "all") {
      // Получаем абсолютно все задачи
    } else if (status === "completed") {
      query += " WHERE status = $1";
      values.push("completed");
    } else if (status === "cancelled") {
      query += " WHERE status = $1";
      values.push("cancelled");
    } else {
      // По умолчанию показываем только незавершённые
      query += " WHERE status != $1";
      values.push("completed");
    }

    query += " ORDER BY due_at ASC";

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения задач:", error);
    res.status(500).json({
      error: "Не удалось получить задачи"
    });
  }
});


// Получить одну задачу
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Некорректный ID задачи" });
      return;
    }

    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Задача не найдена" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка получения задачи:", error);
    res.status(500).json({ error: "Не удалось получить задачу" });
  }
});

// Создать задачу
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, due_at } = req.body;

    if (
      typeof title !== "string" ||
      title.trim().length === 0 ||
      title.trim().length > 200
    ) {
      res.status(400).json({ error: "Название обязательно (до 200 символов)" });
      return;
    }

    if (
      priority !== undefined &&
      !["low", "medium", "high"].includes(priority)
    ) {
      res.status(400).json({ error: "Некорректный приоритет" });
      return;
    }

    if (
      typeof due_at !== "string" ||
      Number.isNaN(Date.parse(due_at))
    ) {
      res.status(400).json({ error: "Укажите корректную дату и время" });
      return;
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      res.status(400).json({ error: "Описание должно быть текстом" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, priority, due_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        title.trim(),
        description ?? null,
        priority ?? "medium",
        due_at
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания задачи:", error);
    res.status(500).json({ error: "Не удалось создать задачу" });
  }
});

// Изменить задачу
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Некорректный ID задачи" });
      return;
    }

    const { title, description, priority, due_at, status } = req.body;

    const fields = [
      { name: "title", value: title, valid: (v: unknown) =>
        typeof v === "string" && v.trim().length > 0 && v.trim().length <= 200
      },
      { name: "description", value: description, valid: (v: unknown) =>
        v === null || typeof v === "string"
      },
      { name: "priority", value: priority, valid: (v: unknown) =>
        ["low", "medium", "high"].includes(v as string)
      },
      { name: "due_at", value: due_at, valid: (v: unknown) =>
        typeof v === "string" && !Number.isNaN(Date.parse(v))
      },
      { name: "status", value: status, valid: (v: unknown) =>
        ["pending", "in_progress", "completed", "cancelled"].includes(v as string)
      }
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of fields) {
      if (field.value !== undefined) {
        if (!field.valid(field.value)) {
          res.status(400).json({
            error: `Некорректное значение поля ${field.name}`
          });
          return;
        }

        values.push(
          field.name === "title" ? (field.value as string).trim() : field.value
        );

        updates.push(`${field.name} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      res.status(400).json({ error: "Нет данных для изменения" });
      return;
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    const result = await pool.query(
      `UPDATE tasks
       SET ${updates.join(", ")}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Задача не найдена" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка изменения задачи:", error);
    res.status(500).json({ error: "Не удалось изменить задачу" });
  }
});

// Удалить задачу
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Некорректный ID задачи" });
      return;
    }

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING id"
    , [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Задача не найдена" });
      return;
    }

    res.json({ message: "Задача удалена", id });
  } catch (error) {
    console.error("Ошибка удаления задачи:", error);
    res.status(500).json({ error: "Не удалось удалить задачу" });
  }
});

export default router;
