/**
 * Predefined content creator-related freelancer roles
 * These roles represent specialized functions across the video & creator production workflow.
 */

const FREELANCER_CONTENT_ROLES = [
  {
    id: 'video_editor_longform',
    name: 'Video Editor (Long-Form / YouTube)',
    category: 'Video Editing',
    description: 'Long-form YouTube video editing, multi-cam pacing, narrative storytelling, retention cuts, and b-roll assembly.',
    suggestedSkills: ['Storytelling', 'Pacing', 'Multi-Cam Editing', 'B-Roll Sync', 'J-Cuts & L-Cuts', 'Audio Balancing'],
    suggestedTools: ['Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'CapCut Pro'],
    defaultTurnaroundDays: 4,
    recommendedBudgetRange: { min: 4000, max: 20000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Rough Cut & Story Assembly',
        description: 'First timeline pass, rhythm, storytelling cut, and basic clip selection.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Sound Design, B-Roll & Color Grading',
        description: 'Audio leveling, SFX, background music mixing, cinematic color LUT application.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: 4K Master Export & Short Teasers',
        description: 'High-res master deliverable, final captions, and 2 vertical shorts.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'video_editor_shortform',
    name: 'Short-Form Video Editor (Reels / TikTok / Shorts)',
    category: 'Short-Form & Social',
    description: 'High-energy 9:16 vertical video edits with animated captions, viral sound effects, zoom cuts, and retention hooks.',
    suggestedSkills: ['Hook Creation', 'Viral Pacing', 'Animated Captions', 'Fast Cuts', 'Sound FX Timing', 'Motion Tracking'],
    suggestedTools: ['CapCut Pro', 'Adobe Premiere Pro', 'After Effects'],
    defaultTurnaroundDays: 2,
    recommendedBudgetRange: { min: 1000, max: 6000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Hook & Pacing Assembly',
        description: 'First 3-second retention hook cut, timeline synchronization, and dynamic pacing.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Animated Captions & Sound FX',
        description: 'Kinetic caption animations, viral sound whooshes, zoom cuts, and motion tracking.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: Final 9:16 Master Render',
        description: 'Clean high-bitrate vertical export, clean thumbnail cover frame, revision tweaks.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'thumbnail_designer',
    name: 'Thumbnail Designer',
    category: 'Design & Packaging',
    description: 'High-CTR YouTube thumbnail creation, expressive facial cutouts, bold typography, color grading, and visual packaging.',
    suggestedSkills: ['High-CTR Packaging', 'Color Theory', 'Photo Manipulation', 'Typography', 'Lighting & Shadow Matching'],
    suggestedTools: ['Adobe Photoshop', 'Figma', 'Lightroom'],
    defaultTurnaroundDays: 1,
    recommendedBudgetRange: { min: 800, max: 4000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Concept Layouts & Composition (3 Ideas)',
        description: '3 wireframe sketches/concepts testing subject placement, focal point, and text hook.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: High-Res Retouching & Bold Typography',
        description: 'Polished face cutout with realistic lighting, background grading, vibrant colors and drop shadows.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: Final 1280x720 Export & A/B Variants',
        description: 'Optimized YouTube PNG/JPG deliverables, editable PSD/Figma source file, and 1 title test variant.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'scriptwriter_researcher',
    name: 'Scriptwriter & Content Researcher',
    category: 'Content Writing',
    description: 'Deep content research, storytelling outlines, video scripts, psychological retention hooks, and CTA crafting.',
    suggestedSkills: ['Hook Writing', 'Story Arc Architecture', 'Audience Retention', 'Fact Checking', 'SEO Topic Research'],
    suggestedTools: ['Google Docs', 'Notion', 'Collabo AI', 'VidIQ'],
    defaultTurnaroundDays: 3,
    recommendedBudgetRange: { min: 2500, max: 12000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Deep Research & Retention Hook Outline',
        description: 'Topic research dossier, 3 psychological opening hook variations, and 5-act bullet outline.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Complete Word-for-Word First Draft',
        description: 'Full narrative script with visual cues, b-roll directions, and pacing notes.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: Polished Final Script & Call-To-Action',
        description: 'Line edits, punchy transition trimming, call-to-action optimization, and YouTube description/tags.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'motion_graphics_vfx',
    name: 'Motion Graphics & VFX Artist',
    category: 'Animation & VFX',
    description: 'Custom title animations, kinetic typography, 2D/3D map animations, Lower Thirds, and advanced visual effects.',
    suggestedSkills: ['Kinetic Typography', 'Title Card Animations', '3D Element Comping', 'Rotoscoping', 'Screen Replacements'],
    suggestedTools: ['Adobe After Effects', 'Blender', 'Cinema 4D'],
    defaultTurnaroundDays: 4,
    recommendedBudgetRange: { min: 3500, max: 18000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Styleframes & Moodboard Storyboard',
        description: 'Static visual design frames, font selection, palette direction, and animation storyboard.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Motion Animation Preview Cut',
        description: 'Dynamic kinetic animations, transitions, and 2D/3D elements in motion for timing check.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: ProRes 4444 Alpha Renders & Templates',
        description: 'Final transparent alpha channel exports, MOGRT templates, and project source package.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'sound_designer_engineer',
    name: 'Sound Designer & Audio Engineer',
    category: 'Audio Production',
    description: 'Dialogue restoration, noise reduction, Foley sound effects, whooshes/impacts, and commercial audio mastering.',
    suggestedSkills: ['Audio Leveling', 'Noise Reduction', 'Foley & SFX Mixing', 'EQ & Compression', 'Loudness Compliance (LUFS)'],
    suggestedTools: ['Adobe Audition', 'FL Studio', 'Ableton Live', 'Logic Pro', 'Audacity'],
    defaultTurnaroundDays: 2,
    recommendedBudgetRange: { min: 1500, max: 8000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Dialogue Cleanup & EQ Balancing',
        description: 'Background noise removal, room echo de-reverb, sibilance de-essing, and voice presence EQ.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Foley, Ambience & SFX Layering',
        description: 'Cinematic whooshes, impacts, ambient room tone, and background music ducking synchronization.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: Final Master (-14 LUFS) & Stem Exports',
        description: 'Broadcast-compliant loudness master, separate dialogue/SFX/music stems, and uncompressed WAVs.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'colorist_color_grader',
    name: 'Colorist & Color Grader',
    category: 'Post-Production',
    description: 'Cinematic color correction, shot matching, LUT application, HDR grading, skin tone correction, and stylistic looks.',
    suggestedSkills: ['Shot Matching', 'Skin Tone Isolation', 'Cinematic LUTs', 'Color Balancing', 'Dynamic Range Grading'],
    suggestedTools: ['DaVinci Resolve Studio', 'Lumetri Color', 'Filmlab'],
    defaultTurnaroundDays: 2,
    recommendedBudgetRange: { min: 2000, max: 10000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Color Correction & Multi-Cam Matching',
        description: 'White balance balancing, exposure leveling, multi-camera color temperature matching.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Stylistic Grade & Skin Tone Isolation',
        description: 'Cinematic color palette LUT application, healthy skin tone tracking, and mood contrast curve.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: 4K Master Render & Custom .Cube LUTs',
        description: 'High-bitrate ProRes/DNxHR graded master export and custom reusable .cube LUT files.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'subtitle_caption_specialist',
    name: 'Subtitle & Caption Specialist',
    category: 'Localization & Captions',
    description: 'Word-by-word animated captions, custom emoji highlights, sound markers, SRT exports, and multilingual captions.',
    suggestedSkills: ['Animated Word Highlights', 'Emoji Syncing', 'SRT/VTT Sync', 'Typographical Alignment', 'Multilingual Translation'],
    suggestedTools: ['Submagic', 'CapCut', 'Premiere Pro Essential Graphics'],
    defaultTurnaroundDays: 1,
    recommendedBudgetRange: { min: 800, max: 3500, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Transcript Verification & Timecode Sync',
        description: 'Complete word transcription, spelling verification, and millisecond timecode sync.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Animated Visual Styling & Emoji Highlighting',
        description: 'Hormozi-style animated word bounces, keyword color highlights, and context emojis.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: Burned-in Master & SRT/VTT Delivery',
        description: 'Clean burn-in 1080p/4K delivery alongside universal .SRT and .VTT subtitle files.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'creative_director',
    name: 'Creative Director / Producer',
    category: 'Production Leadership',
    description: 'Overall visual tone, narrative pacing guidance, feedback reviews, quality control, and production timeline oversight.',
    suggestedSkills: ['Creative Strategy', 'Quality Control', 'Packaging Oversight', 'Pacing Direction', 'Team Coordination'],
    suggestedTools: ['Frame.io', 'Notion', 'Collabo Workspace', 'Figma'],
    defaultTurnaroundDays: 5,
    recommendedBudgetRange: { min: 5000, max: 25000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Creative Brief & Production Blueprint',
        description: 'Comprehensive project strategy deck, visual moodboard, and production milestones roadmap.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Production Review & Quality Control Pass',
        description: 'Detailed Frame.io timestamped notes, pacing feedback, and revision management.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: Final Delivery Signoff & Publishing Strategy',
        description: 'Full quality signoff, metadata recommendations, and release packaging approval.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'voiceover_artist',
    name: 'Voiceover Artist / Voice Talent',
    category: 'Voice & Narration',
    description: 'Professional studio-grade voiceover recordings, commercial narration, character voices, and clean WAV deliveries.',
    suggestedSkills: ['Commercial Tone', 'Narrative Storytelling', 'Vocal Pacing', 'Accent Flexibility', 'Clean Studio Audio'],
    suggestedTools: ['Rodecaster / Shure SM7B', 'Audition', 'Reaper'],
    defaultTurnaroundDays: 2,
    recommendedBudgetRange: { min: 1500, max: 9000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: Sample Read & Tone Alignment (30s)',
        description: 'Tone test reading first 30 seconds of script to lock pacing, energy, and inflection.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Complete Studio Recording (All Takes)',
        description: 'Full script narration recorded in acoustic booth with multiple inflection options.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: Mastered 24-bit WAV & Pick-up Retakes',
        description: 'De-breathed, click-removed broadcast master WAV audio file plus any requested line pick-ups.',
        percent: 0.30,
      },
    ],
  },
  {
    id: 'channel_manager_strategist',
    name: 'Channel Manager & Growth Strategist',
    category: 'Channel Management',
    description: 'YouTube SEO, upload optimization, metadata tags, cards/end screens, retention analysis, and A/B thumbnail scheduling.',
    suggestedSkills: ['YouTube SEO', 'A/B Title Testing', 'Audience Retention Analysis', 'End Screen & Card Setup', 'Community Management'],
    suggestedTools: ['YouTube Studio', 'VidIQ', 'TubeBuddy', 'Notion'],
    defaultTurnaroundDays: 3,
    recommendedBudgetRange: { min: 3000, max: 15000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: SEO Keyword Dossier & Title Formulation',
        description: '5 high-CTR title variations, search keyword clustering, and competitor benchmark dossier.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: Metadata Architecture & Cards Setup',
        description: 'High-converting description copy, chapter timestamps, tags, and interactive end screens/cards.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: Launch Optimization & Retention Audit',
        description: 'Initial 48-hour performance report, CTR monitoring, and A/B thumbnail swap recommendation.',
        percent: 0.30,
      },
    ],
  },
  {
    id: '3d_animator_artist',
    name: '3D Modeler & Animator',
    category: 'Animation & VFX',
    description: '3D product renders, custom intro models, physics simulations, camera projections, and 3D environment builds.',
    suggestedSkills: ['3D Modeling', 'Lighting & Texturing', 'Camera Animation', 'Physics Simulations', 'Rendering Optimization'],
    suggestedTools: ['Blender', 'Cinema 4D', 'Unreal Engine', 'Substance Painter'],
    defaultTurnaroundDays: 5,
    recommendedBudgetRange: { min: 5000, max: 25000, currency: 'INR' },
    defaultMilestones: [
      {
        id: 'm1',
        index: 1,
        title: 'Milestone 1: 3D Clay Model & Camera Previz',
        description: 'Untextured mesh geometry layout, scene staging, and camera move playblast animatic.',
        percent: 0.30,
      },
      {
        id: 'm2',
        index: 2,
        title: 'Milestone 2: PBR Materials, Lighting & Physics Sim',
        description: 'Realistic texture mapping, studio HDRI lighting, and dynamic simulations in motion.',
        percent: 0.40,
      },
      {
        id: 'm3',
        index: 3,
        title: 'Milestone 3: 4K Render Passes & 3D Source Files',
        description: 'Full resolution beauty/ambient occlusion/depth EXR passes and packaged Blender/C4D scene.',
        percent: 0.30,
      },
    ],
  }
];

/**
 * Generate calculated milestones for any role based on allocated budget and optional deadline
 * @param {string} roleId 
 * @param {number} budget 
 * @param {Date|string} firstDeadline 
 * @param {string} roleTitle 
 * @returns {Array} Array of milestone objects with exact allocated amounts
 */
function generateMilestonesForRole(roleId, budget, firstDeadline = null, roleTitle = '') {
  const numericBudget = Math.max(0, Number(budget) || 0);

  // Find role template or fall back to generic 3-phase template
  const matchedRole = FREELANCER_CONTENT_ROLES.find(
    (r) => r.id === roleId || (r.name && r.name.toLowerCase() === (roleTitle || '').toLowerCase())
  );

  const templates = matchedRole?.defaultMilestones || [
    {
      id: 'm1',
      index: 1,
      title: 'Milestone 1: Initial Concept & Rough Draft',
      description: 'First draft pass, initial assembly, and direction alignment.',
      percent: 0.30,
    },
    {
      id: 'm2',
      index: 2,
      title: 'Milestone 2: Main Production & Polish',
      description: 'Core polish phase incorporating creator revisions and feedback.',
      percent: 0.40,
    },
    {
      id: 'm3',
      index: 3,
      title: 'Milestone 3: Final Master Deliverables & Packaging',
      description: 'Clean master exports, source files, and final signoff.',
      percent: 0.30,
    },
  ];

  // Calculate exact integer amounts ensuring sum === numericBudget
  const m1Amount = Math.round(numericBudget * templates[0].percent);
  const m2Amount = Math.round(numericBudget * templates[1].percent);
  const m3Amount = Math.max(0, numericBudget - m1Amount - m2Amount);
  const amounts = [m1Amount, m2Amount, m3Amount];

  // Calculate staged deadlines if a first deadline is provided
  const baseDate = firstDeadline ? new Date(firstDeadline) : null;
  const isBaseDateValid = baseDate && !isNaN(baseDate.getTime());

  return templates.map((tmpl, idx) => {
    let milestoneDeadline = null;
    if (isBaseDateValid) {
      if (idx === 0) {
        milestoneDeadline = baseDate;
      } else if (idx === 1) {
        // Milestone 2 is typically +2 days after Milestone 1
        milestoneDeadline = new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      } else {
        // Milestone 3 is typically +4 days after Milestone 1
        milestoneDeadline = new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000);
      }
    }

    return {
      id: tmpl.id || `m${idx + 1}`,
      index: idx + 1,
      title: tmpl.title,
      description: tmpl.description,
      amount: amounts[idx],
      percent: tmpl.percent,
      deadline: milestoneDeadline,
      status: 'pending',
      submittedUrl: '',
      submissionNotes: '',
    };
  });
}

module.exports = {
  FREELANCER_CONTENT_ROLES,
  generateMilestonesForRole,
};
