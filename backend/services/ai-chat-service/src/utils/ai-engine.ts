interface AIResponse {
  content: string;
  subject?: string;
}

const topicResponses: Record<string, AIResponse> = {
  quadratic: {
    subject: 'Mathematics',
    content: `# Quadratic Equations

A **quadratic equation** is a polynomial equation of degree 2:

**Standard Form:** \`ax² + bx + c = 0\` where a ≠ 0

## Methods to Solve

### 1. Factoring
Find two numbers that multiply to \`ac\` and add to \`b\`.

**Example:** \`x² + 5x + 6 = 0\`
→ \`(x + 2)(x + 3) = 0\`
→ \`x = -2\` or \`x = -3\`

### 2. Quadratic Formula
\`x = (-b ± √(b² - 4ac)) / 2a\`

The **discriminant** \`D = b² - 4ac\` tells us:
- D > 0 → Two distinct real roots
- D = 0 → One repeated real root
- D < 0 → No real roots (complex roots)

### 3. Completing the Square
Rewrite as \`(x + p)² = q\`, then solve.

**Practice:** Solve \`2x² - 4x - 6 = 0\` using the quadratic formula.

Would you like me to walk through this step by step?`,
  },

  newton: {
    subject: 'Physics',
    content: `# Newton's Laws of Motion

## First Law — Law of Inertia
> An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by a net external force.

**Example:** A book on a table won't move until you push it.

## Second Law — F = ma
> The net force on an object equals its mass times its acceleration.

\`F = m × a\`

| Quantity | Unit | Symbol |
|----------|------|--------|
| Force | Newton (N) | F |
| Mass | Kilogram (kg) | m |
| Acceleration | m/s² | a |

**Example:** A 5 kg box pushed with 20 N:
\`a = F/m = 20/5 = 4 m/s²\`

## Third Law — Action-Reaction
> For every action, there is an equal and opposite reaction.

**Example:** When you push against a wall, the wall pushes back with equal force.

**Practice Problem:** A 1500 kg car accelerates from 0 to 27 m/s in 9 seconds. Calculate the net force.

Want me to solve this or explain any law in more detail?`,
  },

  chemical_bonding: {
    subject: 'Chemistry',
    content: `# Chemical Bonding

Chemical bonds hold atoms together to form molecules and compounds.

## Types of Chemical Bonds

### 1. Ionic Bonding
- Transfer of electrons from metal to non-metal
- Creates positive (cation) and negative (anion) ions
- **Example:** NaCl — Na loses 1e⁻, Cl gains 1e⁻
- Properties: High melting point, conducts electricity when dissolved

### 2. Covalent Bonding
- Sharing of electron pairs between non-metals
- Can be single, double, or triple bonds
- **Example:** H₂O — Each H shares 1e⁻ with O
- Properties: Lower melting point, poor electrical conductors

### 3. Metallic Bonding
- "Sea of electrons" shared among metal atoms
- **Example:** Copper wire
- Properties: Malleable, ductile, conducts electricity

## Electronegativity
The ability of an atom to attract shared electrons. Increases across a period, decreases down a group.

| Bond Type | Electronegativity Difference |
|-----------|------------------------------|
| Ionic | > 1.7 |
| Polar Covalent | 0.4 - 1.7 |
| Non-polar Covalent | < 0.4 |

**Practice:** Is the bond between C and O ionic or covalent? Why?`,
  },

  photosynthesis: {
    subject: 'Biology',
    content: `# Photosynthesis

The process by which plants convert light energy into chemical energy (glucose).

## Overall Equation
\`6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂\`

## Two Main Stages

### 1. Light-Dependent Reactions (in Thylakoids)
- Chlorophyll absorbs sunlight
- Water molecules split (photolysis): \`2H₂O → 4H⁺ + 4e⁻ + O₂\`
- Produces ATP and NADPH
- Oxygen released as byproduct

### 2. Light-Independent Reactions — Calvin Cycle (in Stroma)
- Uses ATP and NADPH from light reactions
- CO₂ is "fixed" into glucose through a cycle
- Key enzyme: RuBisCO

## Factors Affecting Photosynthesis
1. **Light intensity** — More light = faster rate (up to a point)
2. **CO₂ concentration** — More CO₂ = faster rate (up to a point)
3. **Temperature** — Enzymes work best at 25-35°C

## Why It Matters
- Produces oxygen for all aerobic organisms
- Base of most food chains
- Removes CO₂ from atmosphere

**Think About It:** Why do plants appear green?`,
  },

  trigonometry: {
    subject: 'Mathematics',
    content: `# Trigonometry Basics

Trigonometry studies relationships between angles and sides of triangles.

## SOH-CAH-TOA (Right Triangle)

For angle θ in a right triangle:
- **sin(θ)** = Opposite / Hypotenuse
- **cos(θ)** = Adjacent / Hypotenuse
- **tan(θ)** = Opposite / Adjacent

## Key Values to Memorize

| Angle | sin | cos | tan |
|-------|-----|-----|-----|
| 0° | 0 | 1 | 0 |
| 30° | 1/2 | √3/2 | 1/√3 |
| 45° | 1/√2 | 1/√2 | 1 |
| 60° | √3/2 | 1/2 | √3 |
| 90° | 1 | 0 | undefined |

## Important Identities
1. \`sin²θ + cos²θ = 1\`
2. \`tan θ = sin θ / cos θ\`
3. \`sin(90° - θ) = cos θ\`

## Applications
- Finding heights of buildings/mountains
- Navigation and surveying
- Physics (projectile motion, waves)

**Practice:** A ladder 10m long leans against a wall making a 60° angle with the ground. How high up the wall does it reach?

**Solution:** height = 10 × sin(60°) = 10 × (√3/2) = 5√3 ≈ 8.66m

Want to try more problems?`,
  },

  algebra: {
    subject: 'Mathematics',
    content: `# Algebra Fundamentals

## Linear Equations
Standard form: \`ax + b = c\`

**Solving steps:**
1. Isolate the variable term
2. Divide by the coefficient

**Example:** \`3x + 7 = 22\`
→ \`3x = 15\`
→ \`x = 5\`

## Systems of Equations

### Method 1: Substitution
Solve one equation for a variable, substitute into the other.

### Method 2: Elimination
Add/subtract equations to eliminate one variable.

**Example:**
\`2x + y = 7\`
\`x - y = 2\`

Adding both: \`3x = 9\` → \`x = 3\` → \`y = 1\`

## Polynomials
- **Monomial:** \`5x²\`
- **Binomial:** \`3x + 2\`
- **Trinomial:** \`x² + 5x + 6\`

## Key Algebraic Identities
1. \`(a + b)² = a² + 2ab + b²\`
2. \`(a - b)² = a² - 2ab + b²\`
3. \`(a + b)(a - b) = a² - b²\`

**Practice:** Simplify \`(2x + 3)² - (2x - 3)²\`

Need help with a specific algebra topic?`,
  },

  electricity: {
    subject: 'Physics',
    content: `# Electricity

## Current, Voltage, and Resistance

- **Current (I):** Flow of electric charge, measured in Amperes (A)
- **Voltage (V):** Potential difference, measured in Volts (V)
- **Resistance (R):** Opposition to current flow, measured in Ohms (Ω)

## Ohm's Law
\`V = I × R\`

**Example:** If R = 10Ω and I = 2A, then V = 20V

## Series Circuits
- Same current through all components
- Voltage divides: \`V_total = V₁ + V₂ + V₃\`
- Resistance adds: \`R_total = R₁ + R₂ + R₃\`

## Parallel Circuits
- Same voltage across all branches
- Current divides: \`I_total = I₁ + I₂ + I₃\`
- Resistance: \`1/R_total = 1/R₁ + 1/R₂ + 1/R₃\`

## Electrical Power
\`P = V × I = I²R = V²/R\`

Unit: Watt (W)

**Example:** A 60W bulb on 220V:
\`I = P/V = 60/220 = 0.27A\`

**Practice:** Two resistors of 6Ω and 12Ω are connected in parallel. Find the total resistance.

Shall I solve this or explain any concept further?`,
  },

  organic_chemistry: {
    subject: 'Chemistry',
    content: `# Organic Chemistry Basics

Organic chemistry is the study of carbon-containing compounds.

## Carbon's Special Properties
- Can form **4 bonds** (tetravalent)
- Forms **chains, branches, and rings**
- Can form single, double, and triple bonds

## Homologous Series

### 1. Alkanes (CₙH₂ₙ₊₂) — Single bonds only
- Methane: CH₄
- Ethane: C₂H₆
- Propane: C₃H₈

### 2. Alkenes (CₙH₂ₙ) — One double bond
- Ethene: C₂H₄
- Propene: C₃H₆

### 3. Alkynes (CₙH₂ₙ₋₂) — One triple bond
- Ethyne (Acetylene): C₂H₂

## Functional Groups
| Group | Name | Example |
|-------|------|---------|
| -OH | Alcohol | Ethanol (C₂H₅OH) |
| -COOH | Carboxylic Acid | Acetic acid (CH₃COOH) |
| -CHO | Aldehyde | Formaldehyde (HCHO) |

## Isomerism
Same molecular formula, different structural arrangements.

**Example:** C₄H₁₀ can be:
- n-Butane (straight chain)
- Isobutane (branched)

**Practice:** Draw all possible isomers of C₃H₈O.`,
  },

  shakespeare: {
    subject: 'English Literature',
    content: `# Shakespeare's Major Themes

## 1. Appearance vs Reality
Works like **Hamlet** and **Macbeth** explore the difference between what seems to be and what actually is.

> "All that glitters is not gold" — The Merchant of Venice

## 2. Power and Ambition
- **Macbeth:** Unchecked ambition leads to downfall
- **Julius Caesar:** The corrupting nature of power
- **Richard III:** Power obtained through deception

## 3. Love and Its Complexities
- **Romeo and Juliet:** Passionate but doomed love
- **A Midsummer Night's Dream:** The absurdity of love
- **Twelfth Night:** Disguise and mistaken identity in love

## 4. Fate vs Free Will
- Are characters masters of their destiny?
- **Romeo and Juliet:** "Star-crossed lovers"
- **Macbeth:** The witches' prophecies vs personal choice

## 5. Order and Disorder
- The Great Chain of Being
- When natural order is disrupted, chaos follows
- Restoration of order at the play's end

## Literary Devices Shakespeare Used
1. **Soliloquy** — Character speaks thoughts aloud
2. **Dramatic irony** — Audience knows what characters don't
3. **Iambic pentameter** — 10 syllables per line, da-DUM pattern
4. **Puns and wordplay** — Multiple meanings

**Discussion:** How does the theme of ambition in Macbeth relate to today's world?`,
  },

  world_war: {
    subject: 'History',
    content: `# World War II — Causes and Overview

## Main Causes

### 1. Treaty of Versailles (1919)
- Harsh penalties on Germany after WWI
- War reparations, territory loss, military restrictions
- Created resentment and economic hardship

### 2. Rise of Fascism
- **Germany:** Adolf Hitler and the Nazi Party (1933)
- **Italy:** Benito Mussolini (1922)
- **Japan:** Military expansionism in Asia

### 3. Failure of Appeasement
- Britain and France tried to avoid war by giving in to Hitler's demands
- Munich Agreement (1938) — gave Sudetenland to Germany
- Only emboldened further aggression

### 4. Economic Depression
- Great Depression (1929) created poverty worldwide
- Extremist parties gained support

## Key Events Timeline
| Year | Event |
|------|-------|
| 1939 | Germany invades Poland — WWII begins |
| 1940 | Fall of France, Battle of Britain |
| 1941 | Germany invades USSR, Pearl Harbor |
| 1942 | Battle of Stalingrad, Midway |
| 1944 | D-Day — Allied invasion of Normandy |
| 1945 | Germany surrenders (May), Atomic bombs on Japan (Aug), Japan surrenders (Sep) |

## Impact
- ~75 million deaths
- Formation of United Nations
- Beginning of Cold War
- Decolonization movements

**Think About It:** Could WWII have been prevented? What lessons can we learn?`,
  },

  magnetism: {
    subject: 'Physics',
    content: `# Magnetism

## Magnetic Fields
- Region around a magnet where magnetic forces act
- Field lines go from **North to South** (outside the magnet)
- Closer lines = stronger field

## Properties of Magnets
1. Like poles repel, unlike poles attract
2. Every magnet has North and South poles
3. Breaking a magnet creates two smaller magnets

## Electromagnetism
An electric current creates a magnetic field.

### Solenoid
A coil of wire that acts like a bar magnet when current flows through it.

**Increasing strength:**
- More turns of wire
- Higher current
- Adding an iron core

## Electromagnetic Induction (Faraday's Law)
> A changing magnetic field induces an electromotive force (EMF).

\`EMF = -N × (ΔΦ/Δt)\`

Where N = number of turns, Φ = magnetic flux

**Applications:**
- Electric generators
- Transformers
- Induction cooktops

## Fleming's Rules
- **Left Hand Rule** (Motor): Force on current-carrying conductor in a magnetic field
- **Right Hand Rule** (Generator): Direction of induced current

**Practice:** A wire 0.5m long carries 3A of current perpendicular to a 0.2T magnetic field. Find the force on the wire.

\`F = BIL = 0.2 × 3 × 0.5 = 0.3N\`

Want to explore more about electromagnetism?`,
  },

  acids_bases: {
    subject: 'Chemistry',
    content: `# Acids, Bases and pH

## What are Acids and Bases?

### Acids
- Produce H⁺ ions in water
- pH < 7
- Taste sour
- Examples: HCl, H₂SO₄, CH₃COOH

### Bases
- Produce OH⁻ ions in water
- pH > 7
- Feel slippery
- Examples: NaOH, KOH, Ca(OH)₂

## The pH Scale
\`0 ←— Acidic —— 7 (Neutral) —— Basic —→ 14\`

| pH | Substance |
|----|-----------|
| 1 | Stomach acid |
| 3 | Vinegar |
| 7 | Pure water |
| 8 | Baking soda |
| 13 | Bleach |

## Neutralization Reaction
\`Acid + Base → Salt + Water\`

**Example:** \`HCl + NaOH → NaCl + H₂O\`

## Indicators
| Indicator | Acid | Base |
|-----------|------|------|
| Litmus | Red | Blue |
| Phenolphthalein | Colorless | Pink |
| Methyl Orange | Red | Yellow |

## Strong vs Weak
- **Strong acids/bases:** Fully ionize (HCl, NaOH)
- **Weak acids/bases:** Partially ionize (CH₃COOH, NH₃)

**Practice:** What is the pH of a 0.01M HCl solution?

Hint: HCl is a strong acid, so [H⁺] = 0.01M, pH = -log(0.01) = 2`,
  },
};

const subjectKeywords: Record<string, string[]> = {
  quadratic: ['quadratic', 'equation', 'polynomial', 'factoring', 'discriminant'],
  newton: ['newton', 'force', 'motion', 'inertia', 'f=ma', 'action reaction'],
  chemical_bonding: ['chemical bond', 'ionic', 'covalent', 'metallic bond', 'electronegativity'],
  photosynthesis: ['photosynthesis', 'chlorophyll', 'calvin cycle', 'plant energy'],
  trigonometry: ['trigonometry', 'sin', 'cos', 'tan', 'soh cah toa', 'triangle angle'],
  algebra: ['algebra', 'linear equation', 'polynomial', 'variable', 'simplify expression'],
  electricity: ['electricity', 'current', 'voltage', 'resistance', 'ohm', 'circuit', 'parallel series'],
  organic_chemistry: ['organic chemistry', 'alkane', 'alkene', 'functional group', 'carbon compound', 'isomer'],
  shakespeare: ['shakespeare', 'hamlet', 'macbeth', 'romeo juliet', 'literary', 'soliloquy'],
  world_war: ['world war', 'wwii', 'ww2', 'hitler', 'nazi', 'treaty versailles'],
  magnetism: ['magnet', 'magnetic field', 'electromagnetic', 'faraday', 'solenoid', 'fleming'],
  acids_bases: ['acid', 'base', 'ph', 'neutralization', 'litmus', 'indicator'],
};

const defaultResponse: AIResponse = {
  content: `I'm your **AI Tutor**, here to help you learn! I cover the Grade 9-10 curriculum.

**Subjects I can help with:**
- **Mathematics:** Algebra, Trigonometry, Quadratic Equations
- **Physics:** Newton's Laws, Electricity, Magnetism
- **Chemistry:** Chemical Bonding, Organic Chemistry, Acids & Bases
- **Biology:** Photosynthesis, Cell Biology
- **English:** Shakespeare, Literary Analysis
- **History:** World Wars, Modern History

**How I can help:**
- Explain concepts step by step
- Provide practice questions
- Help with assignment understanding (no direct answers!)
- Create revision summaries

What would you like to learn about today?`,
};

export function detectTopic(message: string): string | null {
  const lowerMsg = message.toLowerCase();

  for (const [topic, keywords] of Object.entries(subjectKeywords)) {
    for (const keyword of keywords) {
      if (lowerMsg.includes(keyword)) {
        return topic;
      }
    }
  }

  return null;
}

export function getBuiltInResponse(message: string): AIResponse {
  const topic = detectTopic(message);

  if (topic && topicResponses[topic]) {
    return topicResponses[topic];
  }

  // Check for general greetings
  const greetings = ['hello', 'hi', 'hey', 'help', 'start', 'what can you'];
  const lowerMsg = message.toLowerCase();
  if (greetings.some((g) => lowerMsg.includes(g))) {
    return defaultResponse;
  }

  return {
    content: `I understand you're asking about "${message.substring(0, 50)}..."

I don't have a detailed lesson prepared for this specific topic yet, but I can help! Here's what I suggest:

1. **Be more specific** — Tell me the subject and exact topic (e.g., "Explain Newton's second law" or "Help me solve quadratic equations")
2. **Ask for practice** — I can create practice problems for topics I know
3. **Ask for a summary** — I can provide quick revision notes

**Topics I'm great at:**
Mathematics, Physics, Chemistry, Biology, English Literature, History

What specific topic would you like to explore?`,
  };
}

export const suggestedQuestions = [
  { icon: 'Calculator', text: 'Explain quadratic equations step by step', subject: 'Mathematics' },
  { icon: 'FlaskConical', text: 'What is chemical bonding?', subject: 'Chemistry' },
  { icon: 'BookOpen', text: "Help me understand Newton's laws of motion", subject: 'Physics' },
  { icon: 'History', text: 'Summarize World War II causes', subject: 'History' },
  { icon: 'Zap', text: "Explain Ohm's law and circuits", subject: 'Physics' },
  { icon: 'Leaf', text: 'How does photosynthesis work?', subject: 'Biology' },
  { icon: 'Triangle', text: 'Teach me trigonometry basics', subject: 'Mathematics' },
  { icon: 'BookOpen', text: "What are Shakespeare's major themes?", subject: 'English' },
];
