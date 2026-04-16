# Homepage Editor Guide - Wissen-Haus CMS

## Section Types & Layouts

The modern homepage supports 9 different section types, each with specific layout and functionality.

### 1. **Hero Section**
Full-width banner with background image and overlay. Perfect for the main landing section.

**Fields:**
- Title: Main heading (large, prominent)
- Subtitle: Secondary heading
- Description: Body text
- Image URL: Background image (will be overlaid with gradient)
- Button Text & URL: Optional call-to-action

**Example:**
```
Title: "Empowering Future Leaders"
Subtitle: "Building pathways to success"
Description: "Through education and mentorship..."
Image URL: https://example.com/hero.jpg
Button: "Donate Now" → /donate
```

---

### 2. **Header Section**
Clean section for important announcements or subheadings.

**Fields:**
- Title: Section heading
- Subtitle: Secondary text
- Description: Body content
- Image URL: Optional header image
- Button: Optional action

**Use for:**
- Mission statements
- Vision declarations
- Section introductions

---

### 3. **Body Section**
Two-column layout with image and text side-by-side.

**Fields:**
- Title: Section heading
- Subtitle: Accent text (colored in primary color)
- Description: Main content
- Image URL: Image that appears alongside text
- Button: Optional link

**Use for:**
- "About Us" sections
- Feature descriptions
- Program overviews

---

### 4. **Stats Section** ⭐ SPECIAL FORMAT
Dashboard displaying impact statistics with numbers and labels.

**HTML Content Format:**
```html
<div data-stat>
  <span data-number>5,000+</span>
  <span data-label>Students Reached</span>
</div>
<div data-stat>
  <span data-number>95%</span>
  <span data-label>Success Rate</span>
</div>
```

Each `data-stat` div creates one statistics card. Copy and paste this format, then edit the numbers and labels.

**Example content in HTML field:**
```html
<div data-stat><span data-number>500+</span><span data-label>Active Mentors</span></div>
<div data-stat><span data-number>20+</span><span data-label>Communities Served</span></div>
```

---

### 5. **Programs Section** ⭐ SPECIAL FORMAT
Card-based layout for showcasing services or programs.

**HTML Content Format:**
```html
<div data-card>
  <span data-icon>📚</span>
  <span data-title>Academic Excellence</span>
  <span data-description>Personalized tutoring and mentorship</span>
  <span data-link href="/programs/academic">Link text</span>
</div>
```

**Complete example with 3 programs:**
```html
<div data-card>
  <span data-icon>📚</span>
  <span data-title>Academic Excellence</span>
  <span data-description>Personalized tutoring and mentorship programs</span>
</div>
<div data-card>
  <span data-icon>💼</span>
  <span data-title>Skills Development</span>
  <span data-description>Job readiness training and vocational skills</span>
</div>
<div data-card>
  <span data-icon>🎯</span>
  <span data-title>Leadership Academy</span>
  <span data-description>Leadership training and personal development</span>
</div>
```

**Emoji suggestions:**
- 📚 Education/Learning
- 💼 Career/Business
- 🎯 Goals/Leadership
- 🌟 Excellence/Quality
- 🤝 Community/Partnership
- 💡 Innovation/Ideas
- 🎓 Graduation/Completion
- 🚀 Growth/Progress

---

### 6. **Testimonials Section** ⭐ SPECIAL FORMAT
Showcase success stories and feedback from program participants.

**HTML Content Format:**
```html
<div data-testimonial>
  <span data-quote>Your testimonial text here. Keep it genuine and impactful.</span>
  <span data-author>Person Name</span>
  <span data-role>Their role or achievement</span>
</div>
```

**Complete example with 3 testimonials:**
```html
<div data-testimonial>
  <span data-quote>Wissen-Haus changed my life. Their mentorship helped me get into university.</span>
  <span data-author>Sarah Johnson</span>
  <span data-role>University Student, Class of 2024</span>
</div>
<div data-testimonial>
  <span data-quote>The programs here are world-class. I gained skills I never thought possible.</span>
  <span data-author>Michael Chen</span>
  <span data-role>Program Graduate, Tech Industry</span>
</div>
<div data-testimonial>
  <span data-quote>This organization is about building confident leaders ready to change the world.</span>
  <span data-author>Amara Okafor</span>
  <span data-role>Community Leader, Alumni</span>
</div>
```

---

### 7. **CTA (Call-to-Action) Section**
Large, prominent section designed to drive action (donations, signups, etc.).

**Fields:**
- Title: Main heading
- Subtitle: Supporting text
- Description: Body content
- Image URL: Optional background image
- Button Text & URL: Primary action
- Background Color: Can customize button color

**Use for:**
- "Donate Now" sections
- "Get Involved" calls
- Emergency appeals
- Limited-time campaigns

---

### 8. **Footer Section**
Smaller section for contact info, final details, or closing remarks.

**Fields:**
- Title: Footer title
- Subtitle: Supporting info
- Description: Contact details or closing message
- Image URL: Optional (e.g., logo or team photo)
- Button: Optional (e.g., "Contact Us")

---

### 9. **Custom Section**
Raw HTML section for completely custom layouts and designs.

**Use when:**
- You need complex layouts
- Creating special effects or animations
- Building custom components
- Embedding third-party widgets

**Security note:** Only authorized admins should edit this section.

---

## Styling & Customization

### Background & Text Colors
- **Background Color**: Hex color (#RRGGBB format)
- **Text Color**: Hex color for text
- Apply gradient effects by editing the rendered output

### Common Colors:
- Primary Blue: #3052d5
- Success Green: #10b981
- Warning Orange: #f59e0b
- Light Gray: #f3f4f6
- Dark Gray: #1f2937
- White: #ffffff

### Images
- Upload images and paste the URL
- Recommended dimensions:
  - Hero: 1920x1080 (16:9)
  - Header: 1200x600 (2:1)
  - Body: 600x400 (3:2)
  - Card images: 300x200 (3:2)

---

## Best Practices

### 1. **Mobile Responsiveness**
All sections automatically adjust for mobile. Keep text concise for smaller screens.

### 2. **Readability**
- Use contrasting colors for text
- Keep descriptions under 200 words
- Use bullet points for lists

### 3. **Call-to-Actions**
- Clear, action-oriented button text
- Limit to 1-2 buttons per section
- Use consistent URLs (e.g., /donate, /contact)

### 4. **Images**
- Use high-quality, relevant images
- Ensure images load quickly (optimize file size)
- Use alt text descriptions in admin

### 5. **Content Updates**
- Keep impact statistics current
- Refresh testimonials quarterly
- Update programs as they evolve

---

## Common Use Cases

### Homepage Flow:
1. Hero (Welcome users)
2. Mission (Build trust)
3. Stats (Show impact)
4. Programs (Explain offerings)
5. Testimonials (Social proof)
6. CTA (Drive action)
7. Footer (Provide contact)

### Fundraising Page:
1. Hero (Compelling story)
2. Header (Explain the need)
3. Stats (Show progress)
4. CTA (Ask for donation)
5. Footer (Thank you message)

---

## Tips & Tricks

### Formatting HTML Content
- Use proper indentation for readability
- Copy from examples and customize
- Test by saving and viewing on the frontpage
- Contact support if formatting breaks display

### Adding Custom Links
In Programs or Testimonials sections, you can add links:
```html
<span data-link href="/programs/name">Learn More →</span>
```

### Seasonal Updates
- Create temporary sections for campaigns
- Use CTA sections for limited-time offers
- Archive old sections by marking inactive

---

## Support & Issues

For questions about specific section types or help with HTML formatting:
1. Reference this guide
2. Contact your administrator
3. Check the example content already on the site

---

**Last Updated:** April 2026
**Version:** 1.0
