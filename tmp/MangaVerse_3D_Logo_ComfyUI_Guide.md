# MangaVerse 3D Logo - ComfyUI Workflow Guide

## Project: MangaVerse Logo Generation  
**Date:** April 20, 2026  
**Purpose:** Generate a 3D logo for MangaVerse site and branding

---

## Quick Start - Main Prompts

### Primary Prompt (Recommended First)
```
3D logo, Mangaverse text with MV monogram, futuristic anime style, floating 3D letters, holographic effect, cyberpunk aesthetic, purple #6C5CE7 and cyan #00CEC9 neon lights, volumetric lighting, glass crystal material, metallic finish, floating manga panels, stars and particles background, depth of field, studio lighting, 8k, ultra detailed, blender 3d render, c4d octane render, clean background
```

### Alternative Prompts

#### Option A: Crystal/Glass Style
```
3D Mangaverse logo, crystal glass letters, refractive material, purple cyan gradient glow, floating anime book pages, holographic particles, cyberpunk neon, studio lighting, octane render, 8k, detailed
```

#### Option B: Neon/Tech Style
```
3D logo with Mangaverse text, LED neon tubes, glowing purple and cyan, circuit board pattern, futuristic tech aesthetic, floating manga panels, dark background, bloom effect, volumetric rays, 8k, hyper detailed
```

#### Option C: Floating Manga Style
```
3D manga logo, floating 3D book with glowing pages, anime character silhouette, purple cyan neon aura, dynamic pose, star particles, cyberpunk aesthetic, dramatic lighting, blender render, 8k
```

#### Option D: Minimalist Modern
```
3D text logo, Mangaverse, sleek metallic letters, subtle purple glow, small floating manga elements, clean gradient background, professional, studio lighting, 4k, minimal
```

### Negative Prompt (Use All)
```
2d, flat, plain text, blurry, low quality, watermark, signature, ugly, deformed, poorly drawn, bad anatomy, cartoon, pixel art, dithering, jpeg artifacts, out of frame
```

---

## ComfyUI Node Settings

### Base Settings
| Setting | Value | Notes |
|---------|-------|-------|
| **Model** | Realistic Vision XL (SDXL) or Animagine XL 3.1 | Best for 3D-style logos |
| **Resolution** | 1024x1024 (square) or 1344x768 (banner) | 1:1 recommended |
| **Steps** | 30-40 | Higher = more detail |
| **CFG Scale** | 7-8 | Lower (7) for creative, higher (8) for strict |
| **Sampler** | Euler a / DPM++ 2M Karras | Smooth results |
| **Seed** | Random | Generate multiple variations |

### Advanced Settings

#### With ControlNet (Recommended)
```
Node: ControlNet Apply
- Preprocessor: canny or depth
- Model: control_v11f1e_sd21_tile [afc97346]
- Weight: 0.5-0.8
- Guide: Upload simple MV logo sketch
```

#### With IP Adapter (Style Transfer)
```
Node: IP Adapter
- Model: ip-adapter-plusSd15
- Weight: 0.6
- Reference: Use anime-style reference image if needed
```

#### Upscale Workflow
```
1. Generate base image at 1024x1024
2. Use Upscale node (2x - Real-ESRGAN)
3. Final resolution: 2048x2048
4. Apply subtle gaussian blur if needed
```

---

## Generation Workflow

### Step-by-Step

1. **Create Prompt** - Use primary prompt above
2. **Set Model** - Realistic Vision XL / Animagine XL 3.1
3. **Configure Settings** - Use base settings table
4. **Generate** - Create 5-10 variations
5. **Select Best** - Pick top 2-3 results
6. **Upscale** - 2x upscale selected images
7. **Post-Process** - Optional: add text in Photoshop

### Variation Tips

| Variation Type | Adjust These |
|---------------|-------------|
| More glowing | Increase bloom effect in post-process |
| More metallic | Add "chrome, mirror finish" to prompt |
| More anime | Use Animagine XL model instead |
| Darker background | Add "dark space background" |
| More particles | Add "star particles, dust" |

---

## Prompt Keywords Reference

### Style Keywords (Add as Needed)
```
cyberpunk, futuristic, neon, holographic, glass, crystal, chrome, metallic
anime, manga style, japanese, minimal, sleek, professional, luxury
volumetric lighting, god rays, bokeh, depth of field
blender, c4d, octane, unreal engine 5, unity
8k, ultra detailed, photorealistic, hyper realistic
```

### Color Keywords
```
purple #6C5CE7, cyan #00CEC9, magenta, electric blue
neon glow, rgb lights, gradient, iridescent
dark background, deep space, starry
```

### Material Keywords
```
glass crystal, chrome, matte, glossy, reflective
holographic, iridescent, metallic, frosted glass
emerald, diamond, Lucite, acrylic
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Text unreadable | Use shorter text, add "crisp text, clear letters" |
| Too blurry | Increase steps to 40, lower CFG to 6 |
| Flat result | Add "volumetric lighting, 3d render" |
| Wrong colors | Explicitly add hex codes or color names |
| Poor anatomy | Use negative prompt, lower CFG |
| Artifacts | Add "smooth, clean" to prompt |

---

## Output Formats

| Use Case | Resolution | Format | Aspect |
|---------|------------|--------|--------|
| Website Header | 1344x768 | PNG | 16:9 |
| Favicon | 512x512 | PNG | 1:1 |
| Social Media | 1080x1080 | PNG/JPG | 1:1 |
| Banner | 1920x1080 | PNG | 16:9 |
| Print/HD | 2048x2048 | PNG | 1:1 |

---

## Branding Guidelines

### Must Include Colors
- **Primary:** `#6C5CE7` (Electric Purple)
- **Secondary:** `#00CEC9` (Cyan Accent)
- **Background:** `#0D0D1A` (Deep Space)

### Typography
- Headlines: Orbitron (futuristic, tech-forward)
- Body: Inter (clean, readable)

### Tagline
**"Where Manga Meets Tomorrow"**

---

## File Naming Convention

```
mangaverse_logo_[style]_[version]_[date].[ext]

Examples:
mangaverse_logo_crystal_v1_20260420.png
mangaverse_logo_neon_v2_20260420.png
mangaverse_logo_banner_v1_20260420.png
```

---

*Document Version: 1.0*  
*Last Updated: April 20, 2026*