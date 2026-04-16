# Premium Section Types Guide - Wissen-Haus CMS

## 🎯 Hero & Landing Sections

### Hero Premium
Full-screen banner with animated background shapes, gradient overlays, and premium styling.

**Fields:**
- Title: Main headline (appears in extra large font)
- Subtitle: Secondary headline
- Description: Body text
- Image URL: Background image
- Button Text & URL: Primary CTA
- HTML Content: Additional custom content

**HTML Example:** (optional, for additional content)
```html
<p>Additional content between subtitle and description</p>
```

---

### CTA Banner
Call-to-action section with background image and prominent button styling. Perfect for donations.

**Fields:**
- Title: CTA headline
- Subtitle: Supporting text
- Description: Full explanation
- Image URL: Background image
- Button Text & URL: Primary action
- Background Color: Button styling

---

## 📊 Statistics & Data Sections

### Stats Advanced
Impact dashboard with animated gradient cards and hover effects.

**HTML Format:**
```html
<div data-stat>
  <span data-number>5,000+</span>
  <span data-label>Students Reached</span>
  <span data-description>Across all programs</span>
</div>
<div data-stat>
  <span data-number>500+</span>
  <span data-label>Active Mentors</span>
  <span data-description>Dedicated professionals</span>
</div>
```

**Up to 4 stats cards automatically laid out in a grid.**

---

### Donation Tiers
Premium pricing/tier card section for fundraising campaigns.

**HTML Format:**
```html
<div data-tier data-featured>
  <span data-name>Gold</span>
  <span data-amount>1000</span>
  <span data-description>Most Popular</span>
  <span data-benefit>Premium recognition</span>
  <span data-benefit>Impact reports</span>
  <span data-benefit>Exclusive events</span>
</div>
<div data-tier>
  <span data-name>Silver</span>
  <span data-amount>500</span>
  <span data-description>Popular choice</span>
  <span data-benefit>Recognition</span>
  <span data-benefit>Updates</span>
</div>
```

**Features:**
- Responsive grid layout
- "Most Popular" badge for featured tier
- Automatic benefit bullet points
- Hover animations and scale effects

---

## 📋 Content Sections

### Programs Grid
Service/program showcase with 3-column grid and hover effects.

**HTML Format:**
```html
<div data-card>
  <span data-icon>📚</span>
  <span data-title>Academic Excellence</span>
  <span data-description>Personalized tutoring and mentorship</span>
  <span data-link href="/programs/academic">Learn More</span>
</div>
<div data-card>
  <span data-icon>💼</span>
  <span data-title>Skills Development</span>
  <span data-description>Job readiness and vocational training</span>
</div>
```

**Each card includes:**
- Large emoji icon
- Title and description
- Optional link
- Hover animations and bottom border animation

---

### Features List
Two-column layout with features on the left and image on the right.

**HTML Format:**
```html
<div data-feature>
  <span data-title>Feature Title</span>
  <span data-description>Feature description with details</span>
</div>
```

**Includes:**
- Green checkmark icons
- Hover scale effect
- Image on opposite side

---

### Two Column Advanced
Flexible two-column layout with image and content.

**Fields:**
- Title: Section heading
- Subtitle: Accent text
- Description: Main content
- Image URL: Supports left or right placement
- Button: Optional CTA

---

## 👥 People & Community Sections

### Team Section
Team member profile cards in responsive grid.

**HTML Format:**
```html
<div data-member>
  <span data-name>John Smith</span>
  <span data-role>Executive Director</span>
  <span data-bio>10+ years of experience in education</span>
  <img src="https://example.com/john.jpg" alt="John" />
</div>
```

**Features:**
- Profile images (or auto-generated initials)
- Role/title display
- Optional bio
- Hover animations

---

### Testimonials Advanced
Success stories with profile images and star ratings.

**HTML Format:**
```html
<div data-testimonial>
  <span data-quote>This program completely changed my life and helped me achieve my dreams.</span>
  <span data-author>Sarah Johnson</span>
  <span data-role>University Student, Class of 2024</span>
  <img src="https://example.com/sarah.jpg" alt="Sarah" />
</div>
```

**Features:**
- 5-star ratings (automatic)
- Profile images (optional)
- Author name and role
- Dark gradient cards
- Hover effects

---

## 📅 Events & Information Sections

### Events
Event listings with date, location, and description.

**HTML Format:**
```html
<div data-event>
  <span data-title>Summer Camp 2024</span>
  <span data-day>15</span>
  <span data-month>Jun</span>
  <span data-location>Central Youth Center</span>
  <span data-description>Join us for an exciting summer of learning and growth.</span>
</div>
```

**Features:**
- Date display on left
- Location and description
- Left border accent
- Hover animations

---

### Timeline
Historical timeline or milestones with alternating layout.

**HTML Format:**
```html
<div data-timeline-event>
  <span data-title>Organization Founded</span>
  <span data-year>2015</span>
  <span data-description>Wissen-Haus was established with a vision to democratize education.</span>
</div>
<div data-timeline-event>
  <span data-title>100 Students Milestone</span>
  <span data-year>2017</span>
  <span data-description>We reached our first 100 program participants.</span>
</div>
```

**Features:**
- Animated center timeline line
- Alternating layout (left/right)
- Year display
- Progress visualization

---

### FAQ Accordion
Expandable Q&A section with smooth animations.

**HTML Format:**
```html
<div data-faq>
  <span data-question>How do I apply to your programs?</span>
  <span data-answer>You can apply through our website or contact us directly. We welcome applications year-round.</span>
</div>
<div data-faq>
  <span data-question>What is the cost?</span>
  <span data-answer>Our programs are free for eligible youth. We believe education should be accessible to all.</span>
</div>
```

**Features:**
- Click to expand/collapse
- Smooth animations
- Border highlight on hover
- Automatic numbering

---

## 🔗 Utility Sections

### Newsletter
Email signup form with success message.

**Fields:**
- Title: Section heading
- Subtitle: Supporting text
- Description: Full explanation
- Includes built-in email input and subscribe button

**Features:**
- Email validation
- Success confirmation message
- Responsive design
- Beautiful gradient background

---

### Partners
Partner/sponsor logos section.

**HTML Format:**
```html
<div data-partner>
  <span data-name>Partner Name</span>
  <img src="https://example.com/logo.png" alt="Partner" />
</div>
```

**Features:**
- Logo carousel-style grid
- Hover animations
- Responsive columns
- Clean background

---

### Custom
Free-form HTML section for complete creative control.

**Use for:**
- Complex layouts
- Custom scripts
- Embedded content
- Special designs

---

## 🎨 Design Features Across All Sections

### Colors Used
- Primary: #3052d5 (Professional Blue)
- Secondary: #1b4eff (Deeper Blue)
- Accent: #f59e0b (Warm Orange)
- Success: #10b981 (Green)
- Dark: #1f2937 (Charcoal)
- Light: #f3f4f6 (Light Gray)

### Typography
- Headlines: Bold, Black (900 weight)
- Subheadings: Semibold
- Body: Regular weight
- Accents: Primary blue color

### Hover Effects
- Smooth scale (1.05x)
- Shadow enhancements
- Border animations
- Color transitions
- Icon animations

### Responsive Breakpoints
- Mobile: Single column
- Tablet: 2 columns (md breakpoint)
- Desktop: 3-4 columns (lg breakpoint)

---

## 💡 Pro Tips

### Creating Compelling Sections
1. **Use consistent imagery** - Keep style consistent across images
2. **Write concise copy** - Shorter is better on web
3. **Leverage whitespace** - Don't overcrowd sections
4. **Use emojis strategically** - Adds visual interest to cards
5. **Test on mobile** - Ensure responsive design works

### HTML Formatting
- Copy-paste templates and customize
- Always use proper data-attribute syntax
- Test after saving by viewing frontpage
- Use browser dev tools to debug

### Performance
- Compress images before uploading
- Limit sections per page (10-15 is ideal)
- Use lazy loading for heavy content
- Monitor page load speed

---

## 📝 Example Full Homepage

Here's a professional homepage structure:

1. **Hero Premium** - Main landing banner
2. **Stats Advanced** - Impact metrics
3. **Programs Grid** - What we do
4. **Features List** - Why choose us
5. **Testimonials Advanced** - Social proof
6. **Team** - Meet the team
7. **Events** - Upcoming events
8. **FAQ Accordion** - Common questions
9. **Donation Tiers** - How to support
10. **Newsletter** - Stay updated
11. **CTA Banner** - Final call to action

---

## Support

For detailed help with specific section types or HTML formatting:
1. Copy example code from this guide
2. Customize with your content
3. Test by saving and viewing on frontpage
4. Contact admin support if issues arise

---

**Last Updated:** April 2026 | **Version:** 2.0 - Premium Edition
