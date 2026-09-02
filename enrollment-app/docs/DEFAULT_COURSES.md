# Default Course Setup Guide

After setting up the admin dashboard, create these default courses:

## Course 1: Sunday Children & Family Class

**Create Course Form:**
- Name: `Children & Family Class`
- Level: `CHILDREN`
- Type: `REGULAR`
- Day of Week: `Sunday`
- Start Time: `10:30`
- End Time: `11:30`
- Max Students: `20`
- Price per class/session: `8`
- Description: `Beginner capoeira class for children aged 5-14 and families. Focus on basic techniques, rhythm, and cultural education.`

**Duration:** 1 hour
**Price:** £8 per class/session

---

## Course 2: Thursday Beginner Adult Class

**Create Course Form:**
- Name: `Beginner Adult Class`
- Level: `BEGINNER`
- Type: `REGULAR`
- Day of Week: `Thursday`
- Start Time: `18:30`
- End Time: `19:30`
- Max Students: `20`
- Price per class/session: `8`
- Description: `Introduction to capoeira for adults with no prior experience. Learn basic movements, techniques, and the cultural history of capoeira.`

**Duration:** 1 hour
**Price:** £8 per class/session

---

## Course 3: Thursday Intermediate Adult Class

**Create Course Form:**
- Name: `Intermediate Adult Class`
- Level: `INTERMEDIATE`
- Type: `REGULAR`
- Day of Week: `Thursday`
- Start Time: `18:30`
- End Time: `19:30`
- Max Students: `20`
- Price per class/session: `8`
- Description: `For students with 6+ months of capoeira experience. Learn advanced techniques, combinations, and participate in roda practice.`

**Duration:** 1 hour
**Price:** £8 per class/session

---

## Creating Special/Exceptional Courses

For workshops, master classes, or special events:

**Example - Berimbau Workshop:**
- Name: `Berimbau Techniques Workshop`
- Level: `INTERMEDIATE`
- Type: `SPECIAL`
- Date: `2026-09-15` (select a future date)
- Start Time: `14:00`
- End Time: `16:00`
- Max Students: `15`
- Price per class/session: `8`
- Description: `Learn traditional berimbau playing techniques and rhythms. Bring or borrow a berimbau!`

**Duration:** 2 hours
**Price:** £8 per session

---

## Pricing Calculation

All courses use a flat fee per class/session:

```
Price = £8 per class/session
```

### Examples

| Course | Session | Price |
|--------|---------|-------|
| Regular 1-hour class | 1 class/session | **£8** |
| 90-minute workshop | 1 class/session | **£8** |
| 2-hour intensive | 1 class/session | **£8** |
| Half-hour intro | 1 class/session | **£8** |

---

## Notes

- Time format is 24-hour (HH:MM)
  - 6:30 PM = `18:30`
  - 10:30 AM = `10:30`
  
- All times are in local timezone (adjust as needed)

- The price is fixed at £8 per class/session for all courses

- Students see the flat session price in their enrollment confirmation

---

## Email Template

When a student enrolls, they receive an email showing:

```
Course: Children & Family Class
Date: Sunday
Time: 10:30 - 11:30
Price: £8 per class/session

Payment Information:
Payment is due on the day of the course.
We accept: Cash and Bank Transfer

Cancellation Policy:
You can cancel up to 24 hours before the course.
```

---

## Customizing Courses

After creation, you can edit any course:

1. Go to Admin Dashboard → Courses tab
2. Click ✏️ **Edit** on the course card
3. Modify any details
4. Click **Update Course**

To delete a course:

1. Click 🗑️ **Delete** on the course card
2. Confirm deletion
3. Note: Can't delete if students are actively enrolled

---

## API: Create Course via Backend

If you prefer to create courses via API:

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Children & Family Class",
    "description": "Beginner capoeira for children and families",
    "level": "CHILDREN",
    "type": "REGULAR",
    "dayOfWeek": "Sunday",
    "startTime": "10:30",
    "endTime": "11:30",
    "maxStudents": 20,
    "pricePerHour": 8
  }'
```

See [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md) for more details.
