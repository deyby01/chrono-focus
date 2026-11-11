# ChronoFocus — User Guide

ChronoFocus is designed to solve a common problem: **having many things to learn, build, and practice during the day, losing track of priorities, and reaching the end of the day feeling like nothing got finished.**

---

## 1. Registering Your Task Types (`Task Types` Tab)
Create dedicated categories for every pillar of your schedule:
- **Courses & Learning**: Online courses, lectures, certifications.
- **Software Projects**: Coding sprints, feature implementation, debugging.
- **Hobbies & Creative**: Music practice, languages, design, reading.
- Set a **Daily Target Goal (Minutes)** for each type so you can see how balanced your day is.

## 2. Planning Your Day (`Schedule & Tasks` Tab)
1. Click **Schedule New Task** in the sidebar.
2. Enter the task title, pick its **Task Type**, and specify **Planned Time to Spend (Minutes)** (e.g., `45m` or `60m`).
3. Assign an optional **Time Slot** (e.g., `09:00`, `14:30`) so your day is ordered chronologically.
4. Break the task into concrete **Action Checklist Steps** so you always know the exact next step.

## 3. Running the Reverse Chronometer (`Focus Studio` Tab)
1. Select any task from your **Daily Roadmap** (or click **Focus** on a task card).
2. The **Reverse Chronometer** automatically loads the task's planned duration and counts down in reverse toward `00:00`.
3. You can adjust the countdown at any time using `-5m`, `+5m`, preset buttons (`15m`, `25m`, `45m`, `60m`, `90m`), or a custom minute input.
4. Click **Start Reverse Timer**. While running, the circular ring drains smoothly and the browser tab title displays the live countdown.
5. When the countdown reaches `00:00` (or when you click **Complete Task & Save Time** / **Log Elapsed**), ChronoFocus logs the focus session in PostgreSQL and updates the task's spent time.

## 4. Reviewing Your Daily Resume & Best Time (`Daily Resume & Best` Tab)
- **My Best Single Focus Time**: Displays your longest unbroken focus session record.
- **Best Productive Day Record**: Shows the calendar day where you logged the most total focus hours.
- **Peak Productivity Window**: Identifies the exact hour of the day (`HH:00 - HH:00`) when you complete the most deep work.
- **Time Spent Completing Tasks**: Tracks total time invested across completed tasks vs. planned budgets.
- **Daily Resume**: Summarizes today's completed tasks, completion rate percentage, and time spent per category against your daily targets.

