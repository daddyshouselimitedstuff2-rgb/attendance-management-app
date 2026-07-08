-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "breakStart" DATETIME,
    "breakEnd" DATETIME,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("breakEnd", "breakStart", "createdAt", "date", "employeeId", "endTime", "id", "note", "startTime", "updatedAt") SELECT "breakEnd", "breakStart", "createdAt", "date", "employeeId", "endTime", "id", "note", "startTime", "updatedAt" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
