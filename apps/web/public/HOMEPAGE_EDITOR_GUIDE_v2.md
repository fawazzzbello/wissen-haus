# 🎨 Wissen-Haus Homepage Editor - Complete Guide

## Overview

The Wissen-Haus homepage is now fully dynamic and editable from the admin dashboard. Every section, text, image, and color can be customized without touching code.

**Admin URL:** `/admin/homepage`

---

## 15 Modern Section Types

### 1. **Hero Premium** 🎯
**Best for:** Main landing section, campaigns

The hero section dominates the screen with:
- Full-screen background image with dark overlay
- Large animated headline (5xl+ on desktop)
- Subtitle and description text
- Two call-to-action buttons
- Animated background shapes

**Edit in Admin:**
- Title: Main headline
- Subtitle: Secondary text
- Description: Body content
- Image URL: Background image
- Button Text & URL: Primary CTA
- Background/Text Colors: Customize colors

---

### 2. **Stats Advanced** 📊
**Best for:** Impact metrics, achievements

Displays 4 statistics in cards with:
- Animated stat numbers (5000+, 95%, etc.)
- Stat labels and descriptions
- Gradient backgrounds
- Hover animations

**HTML Format:**
```html
<div data-stat>
  <span data-number>5,000+</span>
  <span data-label>Students Reached</span>
  <span data-description>Across our programs</span>
</div>
```

**How to Edit:**
1. Change the section type to "Stats Advanced"
2. Add title and subtitle
3. Paste HTML in the "HTML Content" field
4. Copy a stat block and change the numbers/labels
5. Save - changes appear instantly!

---

### 3. **Programs Grid** 🎓
**Best for:** Showcase services, programs, features

6-card grid featuring your programs with:
- Large emoji icons
- Program title
- Description text
- Hover lift animation
- Optional links (data-link)

**HTML Format:**
```html
<div data-card>
  <span data-icon>📚</span>
  <span data-title>Academic Excellence Program</span>
  <span data-description>Personalized tutoring and mentorship</span>
  <span data-link href="/programs/academic">Learn More</span>
</div>
```

**To Add/Edit Programs:**
1. Copy entire `<div data-card>...</div>` block
2. Change the icon emoji
3. Update title and description
4. Repeat for each program (up to 6)
5. Save

---

### 4. **Features List** ✅
**Best for:** Key benefits, why choose us

Two-column layout with:
- Image on left/right (alternates)
- Feature title with checkmark icon
- Feature description
- Gradient background

**HTML Format:**
```html
<div data-feature>
  <span data-title>Personalized Mentorship</span>
  <span data-description>One-on-one relationships...</span>
</div>
```

---

### 5. **Testimonials Advanced** ⭐
**Best for:** Social proof, success stories

3-column card layout featuring:
- 5-star rating display
- Client quote in italics
- Client name (bold)
- Client role/title
- Optional client image

**HTML Format:**
```html
<div data-testimonial>
  <span data-quote>Amazing program that changed my life...</span>
  <span data-author>Sarah Johnson</span>
  <span data-role>Software Engineer, Tech Industry</span>
  <!-- Optional: <img src="..." /> -->
</div>
```

---

### 6. **Team Section** 👥
**Best for:** Meet the team

4-column grid (2 on mobile) with:
- Team member image (or initial avatar)
- Name
- Role/title
- Bio (optional)

**HTML Format:**
```html
<div data-member>
  <span data-name>John Doe</span>
  <span data-role>Executive Director</span>
  <span data-bio>15 years in education</span>
  <img src="https://..." />
</div>
```

---

### 7. **Events Section** 📅
**Best for:** Upcoming events, dates

Card-based event listings showing:
- Date (day + month in colored box)
- Event title
- Location
- Description

**HTML Format:**
```html
<div data-event>
  <span data-day>15</span>
  <span data-month>Mar</span>
  <span data-title>Annual Gala Dinner</span>
  <span data-location>Convention Center</span>
  <span data-description>Join us for an evening...</span>
</div>
```

---

### 8. **Timeline Section** ⏳
**Best for:** Organization history, milestones

Vertical timeline showing:
- Year/Date
- Event title
- Description
- Alternating left/right layout

**HTML Format:**
```html
<div data-timeline-event>
  <span data-title>Founded Wissen-Haus</span>
  <span data-year>2015</span>
  <span data-description>Started with 50 students...</span>
</div>
```

---

### 9. **FAQ Accordion** ❓
**Best for:** Frequently asked questions

Expandable Q&A with:
- Question as clickable header
- Answer reveals on click
- Smooth animations

**HTML Format:**
```html
<div data-faq>
  <span data-question>How can I enroll?</span>
  <span data-answer>Visit our contact page or call us...</span>
</div>
```

---

### 10. **Donation Tiers** 💳
**Best for:** Donation options, membership levels

3-column pricing/tier cards with:
- Tier name
- Dollar amount
- Description
- Benefits list (checkmarks)
- Call-to-action button

**HTML Format:**
```html
<div data-tier>
  <span data-name>Gold Supporter</span>
  <span data-amount>500</span>
  <span data-description>Annual donation level</span>
  <span data-benefit>Exclusive updates</span>
  <span data-benefit>Annual report</span>
  <span data-featured>true</span>
</div>
```

---

### 11. **Partners Section** 🤝
**Best for:** Sponsor logos, partner companies

Responsive logo grid featuring:
- Company logo images
- Or text fallback

**HTML Format:**
```html
<div data-partner>
  <span data-name>Partner Name</span>
  <img src="https://logo-url.com" />
</div>
```

---

### 12. **Newsletter Section** 📧
**Best for:** Email signup CTA

Full-width signup form with:
- Title and subtitle
- Email input
- Subscribe button
- Success message

**Automatic** - No HTML needed!

---

### 13. **Two Column Advanced** 📐
**Best for:** Flexible content layouts

Side-by-side layout with:
- Image on left or right
- Text on opposite side
- Button below text

**Admin Fields:**
- Title, Subtitle, Description
- Image URL
- Button (optional)

---

### 14. **CTA Banner** 🎊
**Best for:** Call-to-action sections

Full-width banner with:
- Background image overlay
- Large headline
- Subtitle
- Description
- 2 buttons (primary + secondary)

---

### 15. **Custom Section** 🎨
**Best for:** Anything unique

Free-form HTML section for:
- Custom layouts
- Embed videos
- Complex designs
- Special effects

---

## 🎯 How to Use the Admin Editor

### Step 1: Navigate to Homepage Editor
```
Login → Admin Dashboard → Homepage Editor (/admin/homepage)
```

### Step 2: Choose Section Type
1. Click on a section in the left sidebar
2. Change "Section Type" dropdown
3. All fields update for that type

### Step 3: Edit Content
- **Title/Subtitle:** Simple text fields
- **Description:** Multi-line text
- **Image URL:** Paste image link (preview shows automatically)
- **Colors:** Use color picker or hex codes (#RRGGBB)
- **HTML Content:** Paste structured HTML for complex sections

### Step 4: Save Changes
- Click "Save Changes" button
- Success message appears
- Changes instantly appear on frontpage!
- No page refresh needed

### Step 5: Discard Changes
- Click "Discard Changes" to revert
- Original values restored

---

## 📱 Mobile Responsive Behavior

All sections automatically adjust:
- **Mobile (< 640px):** 1 column, full width, large touch targets
- **Tablet (640px - 1024px):** 2 columns, balanced spacing
- **Desktop (> 1024px):** Full 3-4 column layouts, optimized typography

**Always preview on mobile** to ensure text is readable!

---

## 🎨 Design Best Practices

### Colors
- Primary: `#3052d5` (Blue)
- Dark: `#000000` (Black text)
- Light: `#ffffff` (White backgrounds)
- Accent: `#d81b60` (Pink for CTAs)

### Images
- Hero: 1920×1080 (16:9 ratio)
- Cards: 400×300 (4:3 ratio)  
- Profile: 400×400 (square)
- Use high-quality, relevant images

### Text
- Headlines: Clear, benefit-focused
- Descriptions: 2-3 sentences max
- Buttons: Action words ("Donate Now", "Learn More")

---

## 🔄 Content Sync

**Changes Made in Admin** → **Appear on Frontpage**
- Update a section title → Frontpage updates instantly
- Change section type → Layout changes immediately
- Add/remove sections → Frontpage reflects changes
- Edit colors → Live preview on site

**No coding needed!** All editing is done through the admin UI.

---

## 📖 Content Page Editing

The same editor handles Content Pages (About, FAQ, Blog, etc.):
1. Click "Content Pages" tab
2. Select page from list
3. Edit title, slug, content
4. Save changes

---

## ⚠️ Tips & Warnings

✅ **DO:**
- Use emoji in program titles (makes them pop)
- Keep descriptions under 100 words for cards
- Test on mobile after changes
- Use realistic numbers for stats
- Include real testimonials

❌ **DON'T:**
- Leave empty required fields
- Use very long titles (breaks layouts)
- Paste raw HTML without data-* attributes
- Forget to test color contrast (for accessibility)
- Edit more than one section at a time without saving

---

## 🚀 Example: Adding a New Program

1. Go to Admin → Homepage Editor
2. Click "programs" section
3. Change type to "Programs Grid"
4. Scroll to "HTML Content"
5. Find a `<div data-card>` block
6. Copy and paste it
7. Change emoji, title, description
8. Save
9. **Done!** New program appears on homepage

---

## 🎓 Advanced: Custom HTML

For sections with `data-*` attributes, the admin page will:
1. Parse the HTML
2. Extract `data-stat`, `data-card`, etc.
3. Render them as interactive cards
4. Fallback to raw HTML if parsing fails

**Always test your HTML** before saving!

---

## 💡 Pro Tips

1. **Duplicate sections:** Copy entire `<div data-card>...</div>` blocks
2. **Test locally:** Use browser dev tools to check mobile
3. **Backup content:** Keep copies of important text
4. **Use emojis:** Makes content more engaging (📚💼🎯)
5. **Update regularly:** Keep stats current and testimonials fresh

---

## 🆘 Troubleshooting

**Changes not appearing?**
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check "Save Changes" succeeded (green message)
- Section might be inactive (check admin)

**HTML not rendering?**
- Verify `data-*` attribute spelling
- Close all HTML tags properly
- No line breaks in data attributes
- Test in a different browser

**Colors look wrong?**
- Check hex code format (#RRGGBB)
- Verify contrast for accessibility
- Test in mobile view

---

## 📚 Content Resources

**Stock Images:**
- unsplash.com - Free high-quality photos
- pexels.com - Diverse professional images
- pixabay.com - Education and community photos

**Inspiration:**
- Charity websites: globalgiving.org, idealist.org
- Non-profits: asf.org, kiva.org (look at their designs)

---

**Need help?** Contact your administrator or refer to this guide!

**Last Updated:** April 2026
**Version:** 2.0 - Complete Modern Redesign
