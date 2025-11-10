# MurmurMD - Interactive Cardiac Auscultation Simulator

A comprehensive, gamified medical education simulator designed for medical students learning cardiac auscultation skills. Built with modern web technologies and educational best practices.

## 🏥 Project Overview

**MurmurMD** is an interactive web application that simulates a hospital ward experience where medical students practice cardiac auscultation skills through realistic patient cases. The application combines gamification, narrative-driven learning, and evidence-based educational principles.

## ✨ Key Features

### 🎯 **Core Learning Modules**
- **Skills Lab**: Interactive training with adult and paediatric heart sounds
- **Ward Round**: Adult patient cases with randomized answer options
- **Paeds Ward**: Paediatric congenital heart disease cases
- **Resource Library**: Comprehensive medical education resources

### 🎮 **Gamification Elements**
- **Stethoscope Gating**: Must equip stethoscope to listen to audio
- **Progress Tracking**: Real-time accuracy scoring with animated feedback
- **Randomized Answers**: Prevents pattern memorization, forces true learning
- **Animated Feedback**: Visual and audio feedback for correct/incorrect answers
- **Mentor Character**: Dr. Lubb von Dub provides guidance throughout

### 🎵 **Audio Integration**
- **High-Quality Audio**: Real heart sound recordings from University of Washington
- **Volume Boost**: Enhanced audio clarity using Web Audio API
- **Audio Control**: Global audio management with stop/play controls

### 📚 **Educational Resources**
- **UK Medical Guidelines**: NICE, BSE, ESC guidelines
- **Audio Libraries**: University of Washington, Teaching Heart Auscultation
- **Clinical Updates**: Medscape, BMJ Learning resources
- **Learning Tips**: Evidence-based study strategies

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: React Icons (Lucide, Tabler)
- **Audio**: Web Audio API
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/murmur-md.git
cd murmur-md

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
murmur-pov/
├── public/
│   ├── assets/
│   │   ├── audio/          # Heart sound recordings
│   │   └── images/         # Cardiff University logo
├── src/
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🎓 Educational Approach

### Learning Theories Implemented
- **Cognitive Load Theory**: Chunked information, progressive complexity
- **Dual Coding Theory**: Visual + auditory learning pathways
- **Deliberate Practice**: Structured repetition with feedback
- **Retrieval Practice**: Active recall through case-based learning
- **Situated Learning**: Authentic clinical scenarios
- **Connectivism**: Networked learning through resources

### Assessment Features
- **Randomized Answer Positions**: Prevents guessing patterns
- **Immediate Feedback**: Real-time learning reinforcement
- **Progress Tracking**: Visual accuracy indicators
- **Spaced Repetition**: Built-in review cycles

## 🏥 Clinical Content

### Adult Cases (7 cases)
- Normal heart sounds
- Innocent murmurs
- Mitral stenosis
- Bicuspid aortic valve
- Ventricular septal defect
- Mitral valve prolapse
- Patent ductus arteriosus

### Paediatric Cases (9 cases)
- Atrial septal defect
- Pulmonary stenosis
- Patent ductus arteriosus
- Aortic stenosis + regurgitation
- Normal sounds
- Bicuspid aortic valve
- Ventricular septal defect
- Innocent murmurs
- Congenital heart disease variants

## 🌍 Localization

- **British English**: All text uses UK spelling and terminology
- **UK Medical Guidelines**: NICE, BSE, ESC references
- **Cardiff University**: Institutional branding and references
- **NHS Context**: Healthcare system appropriate content

## 📊 Performance Features

- **Responsive Design**: Mobile-first approach
- **Fast Loading**: Optimized assets and code splitting
- **Accessibility**: WCAG compliant design
- **Cross-Browser**: Modern browser support

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### Audio Files
Audio files are stored in `public/assets/audio/` and include:
- Adult case recordings (adultCASE1.mp3 - adultCASE7.mp3)
- Paediatric case recordings (1-ASD.mp3 - 9-VSD.mp3)
- Additional variant recordings

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### GitHub Pages
```bash
# Build the project
npm run build

# Deploy to GitHub Pages
# (Configure in repository settings)
```

## 📝 License

This project is part of a Student Selected Component (SSC) for Cardiff University Medical School.

**Project**: E11 - Creating an Interactive Educational Tool for Fellow Medical Students  
**Tutor**: Dr Alun Owens  
**Student**: Alameen Ayad - Year 2 SSC W1

## 🤝 Contributing

This is an educational project for Cardiff University. For academic use and collaboration, please contact the author.

## 📞 Support

For technical issues or educational questions:
- **Academic**: Contact Dr Alun Owens (Cardiff University)
- **Technical**: Create an issue in this repository

## 🏆 Acknowledgments

- **Audio Sources**: University of Washington Heart Sounds Library
- **Educational Resources**: NICE, BSE, ESC, BHF
- **Institutional Support**: Cardiff University Medical School
- **Tutor Guidance**: Dr Alun Owens

---

**MurmurMD** - Transforming cardiac auscultation education through interactive simulation 🏥✨