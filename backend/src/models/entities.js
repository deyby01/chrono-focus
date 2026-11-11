import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Sequelize ORM entity for the `categories` table (task types).
 * Has many {@link Task} records; deletion is restricted while tasks exist.
 */
export class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 80],
      },
    },
    slug: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#3B82F6',
    },
    icon: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: 'book',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    daily_target_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

/**
 * Sequelize ORM entity for the `tasks` table.
 * Belongs to a {@link Category}; has many {@link FocusSession} records (cascade delete).
 * Stores planned time in minutes and actual logged time in seconds.
 */
export class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(160),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 160],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: [['low', 'medium', 'high', 'critical']],
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'in_progress', 'completed', 'archived']],
      },
    },
    planned_duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 25,
      validate: {
        min: 1,
      },
    },
    actual_duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    scheduled_start_time: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
    },
    checklist: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['scheduled_date'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
    ],
  }
);

/**
 * Sequelize ORM entity for the `focus_sessions` table.
 * Each row is one reverse-chronometer run that belongs to a {@link Task}.
 */
export class FocusSession extends Model {}

FocusSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: 'id',
      },
    },
    planned_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    completed_countdown: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'focus_sessions',
    timestamps: false,
    indexes: [{ fields: ['task_id'] }, { fields: ['started_at'] }],
  }
);

Category.hasMany(Task, {
  foreignKey: 'category_id',
  as: 'tasks',
  onDelete: 'RESTRICT',
});
Task.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

Task.hasMany(FocusSession, {
  foreignKey: 'task_id',
  as: 'sessions',
  onDelete: 'CASCADE',
});
FocusSession.belongsTo(Task, {
  foreignKey: 'task_id',
  as: 'task',
});

