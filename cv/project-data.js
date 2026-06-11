export const projectData = {
  // -------------------------------------------------------------------------
  // CATEGORY: STRUCTURAL ENGINEERING
  // -------------------------------------------------------------------------
  'mega-highrise': {
    title: 'Highrise Timber Diagrid',
    subtitle: 'TU Delft — Most Innovative Design Award',
    year: '2017',
    image: 'images/mega-highrise_timber_Render_2.png',
    alt: 'A model of a tall skyscraper with a wooden diagrid structural system.',
    description: 'Stiffness, not strength, governs a 169 m timber tower. As one of two structural engineers in an eight-person team, designed an LVL diagrid with CLT floors and steel tension rings, tuning the diagrid angle with RBFMOpt against Karamba FEA. The TU Delft reviewer who had called the height impossible in timber approved the structural system.',
    impact: [
      'Won the Stichting Hoogbouw Most Innovative Design Award, best of 15 teams',
      '70% wood by mass; concrete limited to the core, for fire safety only',
      'Reduced vortex shedding with a CFD roundness study of the tower top'
    ],
    technologies: ['Karamba3D', 'RBFMOpt', 'FEA', 'CFD', 'Grasshopper'],
    categories: ['structural'],
    metrics: { primary: '169m', secondary: 'Tower Height' },
    gallery: [
      {
        src: 'images/mega-highrise_timber_Render_2.png',
        caption: 'Global view: the 169 m diagrid tower with concrete core, CLT floors, and steel tension rings.'
      },
      {
        src: 'images/mega-highrise_timber_optimization_1.gif',
        caption: 'Optimization loop: RBFMOpt iterates diagrid angles and cross-sections against Karamba FEA.'
      },
      {
        src: 'images/mega-highrise_timber_beampacking and final structure.jpg',
        caption: 'Cross-section sizing: members sized to unity checks in the final structural layout.'
      }
    ]
  },
  'biosphere-optimization': {
    title: 'Biosphere Structural Design',
    subtitle: 'Vertico, TU Delft & Eigenraam — Structural Design',
    year: '2024',
    image: 'images/biosphere-Visualisation.png',
    alt: 'Finite element analysis visualization of a 5-meter spherical structure composed of hexagonal concrete elements.',
    description: "An unreinforced sphere of printed stones only works if every joint stays in compression. Ran a shape optimization varying wall thickness so the 5 m shell stays compressive under load while the outer surface remains round, and built the parametric model behind Eigenraam's RFEM verification. The final design was accepted, checked against hand calculations.",
    impact: [
      'Optimized wall thickness per stone: compression under load, round on the outside',
      "Fed geometry straight into Eigenraam's RFEM model, so each design iteration could be re-verified",
      'Tested the in-house printing material with SIKA to supply verified strength values'
    ],
    technologies: ['Grasshopper', 'RFEM', '3DCP', 'Material Testing', 'Shell Structures'],
    categories: ['structural', 'fabrication'],
    metrics: { primary: '5m', secondary: 'Diameter' },
    gallery: [
      {
        src: 'images/biosphere-optimization_fem-analysis.jpg',
        caption: 'RFEM verification: the unreinforced shell checked by Eigenraam Engineering.'
      },
      {
        src: 'images/biosphere-optimization_variable thickness.gif',
        caption: 'Variable thickness: wall thickness varies per stone to stay in compression while the outer surface remains spherical.'
      },
      {
        src: 'images/biosphere-small scale prototype.jpg',
        caption: 'Prototype: small-scale printed stones testing the final surface finish and its bioreceptivity.'
      },
    ]
  },
        'HPA-pavilion': {
    title: 'Formwork-Free Shell Pavilion',
    subtitle: 'De Huizenprinters — Fabrication Lead',
    year: '2022',
    image: 'images/huizenprinters-pavilion_assembled-shell.gif',
    alt: 'A segmented, vault-shaped concrete pavilion assembled from 3D-printed parts without internal molds.',
    description: 'Summum Engineering form-found a compression-only concrete vault; turning it into printable parts was the open problem. Split the 3 m shell into eight double-curved segments with stiffening ribs integrated into the print path, so the thin walls would not buckle or crack while curing. The segmentation removed all single-use formwork and falsework from construction; only reusable scaffolding supported assembly.',
    impact: [
      'Produced the first non-planar 3D-printed concrete elements',
      'Segmented the shell into 8 double-curved parts, removing single-use formwork and falsework',
      'Integrated ribs into the print path, preventing buckling and shrinkage cracking during curing'
    ],
    technologies: ['3DCP', 'Non-Planar Printing', 'Shell Structures', 'Segmentation', 'Grasshopper'],
    categories: ['fabrication', 'structural'],
    metrics: { primary: '8', secondary: 'Double-Curved Segments' },
    gallery: [
      {
        src: 'images/huizenprinters-pavilion_assembled-shell.gif',
        caption: 'Assembled vault: eight printed segments form the completed compression-only shell, 3 m tall and 2.5 m wide.'
      },
      {
        src: 'images/huizenprinters-pavilion_during construction.jpg',
        caption: 'Assembly: segments placed on reusable scaffolding, with no single-use formwork or falsework.'
      },
      {
        src: 'images/huizenprinters-pavilion_3D printing of elements.jpeg',
        caption: 'Printing: non-planar deposition of a vault segment, with stiffening ribs built in the same path.'
      },

    ]
  },
  'floor-optimization': {
    title: 'Floorslab Optimization',
    subtitle: "TU Delft — Master's Thesis",
    year: '2020',
    image: 'images/floor-optimization_concrete-shell.webp',
    alt: 'Optimized thin-shell concrete floor slab, demonstrating efficient structural form.',
    description: "A flat concrete slab carries load in bending, the least efficient way to use the material. Developed a derivative-free optimization method coupling FEA (ULS and SLS), casting constraints, and life-cycle assessment to shape variable-thickness thin shells that work through membrane action. The optimized floors cut total environmental footprint by 60.1% to 79.8% against conventional office flooring.",
    impact: [
      'Cut total environmental footprint 60.1% to 79.8% versus conventional office floors',
      'Outperformed timber flooring alternatives on total life-cycle assessment',
      'Verified the optimized shells in Ansys with casting constraints inside the optimization loop'
    ],
    technologies: ['Structural Optimization', 'Ansys', 'LCA', 'Grasshopper', 'Concrete Shells'],
    categories: ['structural'],
    metrics: { primary: '60–80%', secondary: 'Footprint Reduction' },
    gallery: [
            {
        src: 'images/floor-optimization_concrete-shell.webp',
        caption: 'Optimized slab: the variable-thickness shell floor, verified in Ansys.'
      },
      {
        src: 'images/floor-optimization_concrete-overall co2 emissions per flooring system in shadow cost.jpg',
        caption: 'LCA results: CO2 emissions compared across flooring systems in shadow cost.'
      },
      {
        src: 'images/floor-optimization_concrete-overall emissions of flooring system in shadow cost.jpg',
        caption: 'Environmental impact: overall shadow-cost emissions per flooring system.'
      },
            {
        src: 'images/floor-optimization_concrete-shell final shadow cost.jpg ',
        caption: 'Result: total shadow cost of the proposed shell floor against conventional systems.'
      },
    ]
  },
'zaha-hadid-aevum': {
    title: 'Aevum Pavilion',
    subtitle: 'Vertico, ZHA & EOC — Structural Fabrication',
    year: '2024',
    image: 'images/zaha-hadid-aevum.jpg',
    alt: 'Complex 3D-printed concrete corner node with internal post-tensioning channels.',
    description: "Zaha Hadid Architects' Aevum pavilion is held together by post-tensioning, and Eckersley O'Callaghan's structural input existed only as 2D drawings. Translated those drawings into 3D duct geometry and machine toolpaths, resolving the corner nodes where two ducts cross inside a single printed part. EOC approved the geometry; three weeks separated structural concept from fabrication on site.",
    impact: [
      'Resolved duct crossings in every corner node; one node carried three ducts',
      'Used non-planar, variable layer-height slicing to keep ducts aligned without supports',
      'Delivered from 2D structural concept to on-site fabrication in three weeks'
    ],
    technologies: ['Post-Tensioning', '3DCP', 'Non-Planar Slicing', '6-Axis Robotics', 'Grasshopper'],
    categories: ['structural', 'fabrication'],
    metrics: { primary: '3 Weeks', secondary: 'Concept to Fabrication' },
    gallery: [
      {
        src: 'images/zaha-hadid-aevum_corner-detail.gif',
        caption: 'Robotic fabrication: 6-axis printing of a corner node, with internal voids for the post-tensioning ducts.'
      },
      {
        src: 'images/zaha-hadid-aevum during construction.jpeg',
        caption: 'On-site assembly: printed elements positioned before post-tensioning.'
      },
      {
        src: 'images/zaha-hadid-aevum during construction 2.jpeg',
        caption: 'Load transfer: corner nodes carry the post-tensioning forces that keep the concrete in compression.'
      },
            {
        src: 'images/zaha-hadid-aevum.jpg',
        caption: 'Completed pavilion: Aevum at Milan Design Week 2024.'
      }
    ]
  },
  // -------------------------------------------------------------------------
  // CATEGORY: SOFTWARE & TOOLS
  // -------------------------------------------------------------------------
  'vertico-slicer': {
    title: 'Vertico Slicer Plugin',
    subtitle: 'Vertico — Software Development',
    year: '2021–present',
    image: 'images/vertico-slicer_toolpath-simulation.gif',
    alt: 'Grasshopper interface visualizing simultaneous toolpaths for multiple non-planar geometries.',
    description: "Off-the-shelf slicers produce planar 3-axis toolpaths and choke on robot-scale instruction counts. Led development of Vertico's C# slicer for gantry, ABB, and KUKA systems, including an analytical OPW inverse-kinematics solver that simulates non-planar toolpaths of 65,000+ instructions in real time inside Rhino, where conventional tools crash. Now used by 40+ companies worldwide.",
    impact: [
      'Used by 40+ companies worldwide on gantry, ABB, and KUKA printing systems',
      'Runs up to 32 slicing jobs in parallel on production batches',
      'Generates RAPID, KRL, and G-code directly, replacing ABB RobotStudio in the workflow'
    ],
    technologies: ['C#', 'Grasshopper', 'Inverse Kinematics (OPW)', 'RAPID (ABB)', 'KRL (KUKA)'],
    categories: ['software', 'fabrication'],
    metrics: { primary: '40+', secondary: 'Companies Using It' }
  },
  'vasecreator-web-platform': {
    title: 'VaseCreator Web App',
    subtitle: 'Independent Project — Web App',
    year: '2025',
    image: 'images/vasecreator-web-platform_ui-render.gif',
    alt: 'User interface of a web-based parametric design tool displaying a generated 3D vase geometry.',
    description: 'Most people with a 3D printer download models instead of designing them; CAD is the barrier. Built a free browser tool that generates printable vases: an HTML/JavaScript site with a custom geometry engine, Three.js for rendering only, and no backend, exporting watertight STL files. Used by 5,500 people this year, ranking top 3 on Google for six vase-design searches.',
    impact: [
      '5,500 users this year, with 4,000 clicks arriving from Google search',
      'Ranks top 3 on Google for six vase-design search terms',
      'Runs fully in the browser with no backend, including on mid-range phones'
    ],
    technologies: ['JavaScript', 'Three.js', 'Procedural Geometry', 'HTML/CSS', 'SEO'],
    categories: ['software'],
    metrics: { primary: '5,500', secondary: 'Users This Year' }
  },
    
  'earthy-vault': {
    title: 'Earthy Vault Optimization',
    subtitle: 'TU Delft — Humanitarian Design',
    year: '2019',
    image: 'images/earthy-vault.png',
    alt: 'Compression testing of an adobe brick reinforced with straw.',
    description: "Shelter at the Zaatari refugee camp must be built from what is on site: earth, straw, and the residents' own labor. Tested straw-reinforced adobe to 3.24 MPa in compression, fed the measured values into a form-found ribbed vault using dynamic relaxation, and optimized the design across span, mass, and usable height. The result was documented as an illustrated booklet for local construction.",
    impact: [
      'Measured 3.24 MPa compression on straw-reinforced adobe and used it as the FEA input',
      'Form-found the ribbed vault with dynamic relaxation, optimized for span, mass, and usable height',
      'Produced a step-by-step assembly booklet for construction by camp residents'
    ],
    technologies: ['Material Testing', 'Dynamic Relaxation', 'FEA', 'Multi-Objective Optimization', 'Grasshopper'],
    categories: ['structural'],
    metrics: { primary: '3.24 MPa', secondary: 'Adobe Strength' },
    gallery: [
            {
        src: 'images/compression-testing-earthy-vault.webp',
        caption: 'Material testing: compression test of straw-reinforced adobe bricks, measured at 3.24 MPa.'
      },
      {
        src: 'images/earthy-vault-grasshopper script of computational optimization.jpg',
        caption: 'Optimization: Grasshopper script balancing span, mass, and usable height of the vault.'
      },

  ]
  },
  'vertico-hub-platform': {
    title: 'SaaS Licensing Infrastructure',
    subtitle: 'Vertico — Cloud Architecture',
    year: '2023',
    image: 'images/vertico-hub-platform_dashboard.jpg',
    alt: 'Web-based dashboard interface for managing software licenses and user subscriptions.',
    description: 'Desktop Grasshopper plugins generate no recurring revenue without license infrastructure behind them. Built that system solo: a REST API on Google Cloud Run that validates each Rhino/Grasshopper session against a central database, with a web dashboard where admins issue or revoke licenses and users manage their own. In production since September 2025, serving 7 licensed companies and around 25 users.',
    impact: [
      'In production since September 2025: 7 licensed companies, around 25 users',
      'Validates every Grasshopper session against a Cloud Run REST API and central database',
      'Sales issue licenses from the dashboard; customers activate instantly, with no manual key handling'
    ],
    technologies: ['Google Cloud Run', 'REST API', 'C#', 'JavaScript', 'Grasshopper'],
    categories: ['software'],
    metrics: { primary: '7', secondary: 'Licensed Companies' }
  },
  'optimized-foundation': {
    title: 'Automated Foundation Configurator',
    subtitle: 'Vertico — Industrial R&D',
    year: '2023',
    image: 'images/optimized-foundation_ribbed-structure.jpg',
    alt: 'A topologically optimized, rib-stiffened 3D-printed concrete foundation block.',
    description: 'Every controller cabinet along an ERTMS railway line needs a concrete foundation, and casting makes them one-size-fits-all. Built a pipeline that takes load inputs from a web form, generates load-specific ribbed geometry, and writes the ABB RAPID print code with no engineer in between. The printed prototype used 70% less concrete than its cast equivalent.',
    impact: [
      'Cut concrete use 70% against the standard cast foundation',
      'Generates ABB RAPID code directly from web-form load inputs, fully automatic',
      'Reached TRL 5 with a printed working prototype'
    ],
    technologies: ['Structural Optimization', '3DCP', 'RAPID (ABB)', 'Web Configurator', 'Grasshopper'],
    categories: ['software', 'fabrication', 'structural'],
    metrics: { primary: '70%', secondary: 'Material Reduction' }
  },
  'parametric-bench-configurator': {
    title: 'Parametric Bench Configurator',
    subtitle: 'Vertico — Mass Customization',
    year: '2023',
    image: 'images/parametric-bench-configurator_curved-seating.jpg',
    alt: 'A customizable 3D-printed concrete bench with a ribbed texture and organic curves.',
    description: 'A custom concrete bench normally needs its own engineering pass before it can be printed. Built a demonstrator pipeline where a web front end drives a Grasshopper model that applies the fabrication constraints and outputs print files directly, making structurally sound custom designs accessible without an engineer per iteration. Seven demonstrator benches were printed from it.',
    impact: [
      'Printed 7 demonstrator benches directly from configurator output',
      'Encoded fabrication constraints into the model, so every configuration stays printable',
      'No molds: each bench geometry prints directly, with no per-design tooling'
    ],
    technologies: ['Grasshopper', 'Web Configurator', '3DCP', 'Parametric Design', 'Mass Customization'],
    categories: ['software', 'fabrication'],
    metrics: { primary: '7', secondary: 'Demonstrator Benches' }
  },

  // -------------------------------------------------------------------------
  // CATEGORY: DIGITAL FABRICATION
  // -------------------------------------------------------------------------
  'printed-formwork': {
    title: '3D-Printed Formwork',
    subtitle: 'Vertico & University of Liverpool — Lost Formwork',
    year: '2021',
    image: 'images/printed-formwork_concrete-rebar.webp',
    alt: 'A concrete column with internal steel reinforcement, cast within a 3D-printed shell.',
    description: 'Reinforcing printed concrete is the field\'s open problem. For a University of Liverpool research project, printed shells served as permanent lost formwork: rebar cage inside, conventional concrete cast in. Printing, casting, and reinforcement ran at Vertico; compression testing at TU Eindhoven confirmed the hybrid column works.',
    impact: [
      'Interface between printed shell and cast core never cracked under compression testing',
      'Column outperformed the PhD researcher\'s calculated capacity; the printed shell carries load',
      'Outer 2 cm doubles as rebar cover, so the printed formwork adds no material'
    ],
    technologies: ['3DCP', 'Lost Formwork', 'Reinforced Concrete', 'Structural Testing'],
    categories: ['fabrication'],
    metrics: { primary: '2 cm', secondary: 'Cover as Formwork' }
  },
  'design-by-testing': {
    title: 'Design-by-Testing Bench',
    subtitle: 'Vertico for Kiki & Joost — Singer Laren',
    year: '2021',
    image: 'images/design-by-testing_load-test.webp',
    alt: 'A creatively designed concrete bench undergoing a physical load test with over 1000kg of weight.',
    description: "Kiki & Joost's bench had no precedent to calculate from, so proof came from testing instead. Translated the artistic intent into a printable, compression-led structure, then validated it by manually loading the prototype with a tonne of material. The bench now sits in Singer Laren's permanent collection.",
    impact: [
      'Carried a 1,000 kg test load without reinforcement',
      'Rebar added only for exceptional cases, such as lifting the bench from one side',
      "Part of the Singer Laren museum's permanent collection"
    ],
    technologies: ['3DCP', 'Load Testing', 'Compression Structures', 'Design Engineering'],
    categories: ['fabrication', 'structural'],
    metrics: { primary: '1,000 kg', secondary: 'Test Load' }
  },
  'disassemblable-beam': {
    title: 'Disassemblable Beam',
    subtitle: 'Vertico — Circular Construction',
    year: '2022',
    image: 'images/disassemblable-beam_interlocking-segments.webp',
    alt: 'Modular, interlocking components of a post-tensioned beam, demonstrating design for disassembly.',
    description: 'Concrete gets demolished, not disassembled, because monolithic casting allows nothing else. This 2.5-metre prototype splits a post-tensioned beam into five interlocking printed segments with double-curved dry joints, the curvature on both faces achieved by printing onto printed supports. Assembled, tensioned, loaded, and shown at Dutch Design Week 2024.',
    impact: [
      'First post-tensioned beam assembled from separate interlocking printed segments',
      'Double-curved joints on both faces, printed onto printed supports',
      'Assembled, post-tensioned, load-tested, then exhibited at Dutch Design Week 2024'
    ],
    technologies: ['3DCP', 'Post-Tensioning', 'Dry Joints', 'Non-Planar Printing', 'Circular Construction'],
    categories: ['fabrication', 'structural'],
    metrics: { primary: '2.5 m', secondary: 'Five Dry-Joint Segments' }
  },
  'hexastone-pavilion': {
    title: 'Hexastone Pavilion',
    subtitle: 'Vertico — Fabrication Lead',
    year: '2022',
    image: 'images/hexastone-pavilion_concrete-blocks.webp',
    alt: 'An assembly of 106 unique 3D-printed hexagonal concrete blocks forming a complex shell structure.',
    description: "A discrete compression shell only stands if its stones meet precisely, and across 106 unique blocks the print tolerances stack. Translated the student design into fabrication data through the slicer's serial-production workflow and printed all stones in two days, seven minutes each on average. Dry-stacked with filler mortar, the pavilion now stands at its third location.",
    impact: [
      '106 unique stones printed in two days, averaging seven minutes per stone',
      'Dry-stacked with debonding oil and filler mortar, so the shell stays demountable',
      'Taken down and rebuilt twice; now standing at its third location'
    ],
    technologies: ['3DCP', 'Slicer Automation', 'Discrete Shells', 'Serial Production'],
    categories: ['fabrication'],
    metrics: { primary: '106', secondary: 'Unique Stones' }
  },
  'concrete-canoe': {
    title: '3D-Printed Concrete Canoe',
    subtitle: 'Vertico — Applied R&D',
    year: '2022',
    image: 'images/concrete-canoe_floating.jpg',
    alt: 'A watertight 3D-printed concrete canoe floating on water with two occupants.',
    description: 'Print a hull in flat layers and the unsupported spans collapse; concrete cannot print horizontal overhangs. Borrowing from Nubian vault construction, the hull was printed under a 45-degree inclination, turning 100% overhangs into stacked inclined layers. The canoe floated watertight and carried two people — at the time, a first for printed concrete.',
    impact: [
      'Printed at 45° inclination, reaching 100% overhang without support material',
      'Designed for a 250 kg payload and tested afloat with two paddlers',
      'Application of in-house inclined-printing R&D in a working, watertight product'
    ],
    technologies: ['3DCP', 'Inclined Slicing', 'Nubian Vaults', 'Buoyancy Design'],
    categories: ['fabrication'],
    metrics: { primary: '45°', secondary: 'Print Inclination' }
  },
  'nonplanar-facade': {
    title: 'Non-Planar Facade Panels',
    subtitle: 'Vertico, TU/e & Neutelings Riedijk — Project Lead',
    year: '2023',
    image: 'images/nonplanar-facade_curved-panels.webp',
    alt: 'A modern building facade featuring curved, organic panels with a smooth, non-layered finish.',
    description: "Double-curved facade panels normally cost a milled mold each, discarded after casting. In NWO-funded design research with Neutelings Riedijk Architects and TU Eindhoven, a robot first shaped a reusable sand bed, then printed concrete non-planar on top of it. Led the project from Vertico's side; five test panels proved the mold-free workflow.",
    impact: [
      'Robot-shaped, reusable sand bed replaces single-use milled molds',
      'Five double-curved test panels produced in the research programme',
      'NWO-funded collaboration with Neutelings Riedijk Architects and TU Eindhoven'
    ],
    technologies: ['Non-Planar Printing', 'Sand Formwork', 'Robotics', 'Facade Systems'],
    categories: ['fabrication'],
    metrics: { primary: '5', secondary: 'Test Panels' }
  },
  'efficient-bench': {
    title: 'Material-Efficient Bench',
    subtitle: 'Vertico — Public Installation, Delft',
    year: '2021',
    image: 'images/efficient-bench_curved-concrete-bench.webp',
    alt: "A smoothly curved 22-meter concrete retaining wall and bench in a children's playground.",
    description: "A solid cast retaining wall spends most of its concrete doing nothing. Printed with Vertico's set-on-demand system, this 22-metre curved wall-and-bench is hollow, cutting material use by up to 95%, and its seating height varies along the curve to suit children. Installed at a children's playground in Delft.",
    impact: [
      'Hollow print cuts material use by up to 95% versus solid casting',
      'Seating height varies along the length, sized for children where needed',
      "In public use at a children's playground in Delft"
    ],
    technologies: ['3DCP', 'Set-on-Demand Printing', 'Public Furniture', 'Mass Customization'],
    categories: ['fabrication'],
    metrics: { primary: '95%', secondary: 'Material Saved' }
  },
  'manhole-finishing': {
    title: 'Robotic Manhole Finishing',
    subtitle: 'Vertico & Summum Engineering — Execution Lead',
    year: '2023',
    image: 'images/manhole-finishing_robot-arm.webp',
    alt: 'An industrial robot arm with a specialized tool finishing the interior of a large concrete pipe.',
    description: 'Sewer manholes need smooth flow profiles, and the Netherlands alone counts 50,000 with unique geometry. Hand-smoothing is heavy work that fails occupational-health standards; CNC milling the prints broke the budget. Built a rounded sponge end-effector and the slicing algorithm that presses the concrete smooth while still malleable, shaping rather than cutting. The process advanced from TRL 3 to 6.',
    impact: [
      'Advanced robotic manhole fabrication from TRL 3 to TRL 6',
      'Built the end-effector and wrote the slicing algorithm for the smoothing paths',
      'Formative smoothing met surface requirements within budget where CNC milling could not'
    ],
    technologies: ['3DCP', 'Robotics', 'End-Effector Design', 'Toolpath Generation', 'Post-Processing'],
    categories: ['fabrication'],
    metrics: { primary: 'TRL 3→6', secondary: 'Process Maturity' }
  },
  'algorithmic-timber-milling': {
    title: 'Algorithmic Timber Milling',
    subtitle: 'TU Delft — Robotic Fabrication',
    year: '2019',
    image: 'images/robotic-timber-milling_fabrication.gif', // Placeholder
    alt: 'CNC milled timber block displaying two distinct textures: a smooth topographic surface and a chaotic, noise-based texture.',
    description: 'A TU Delft pavilion course left the team with unstructured milling points and no usable path through them. Ordering the points with a traveling-salesman heuristic produced one continuous robotic toolpath, and since the tool angle follows the previous position, the ordering itself became a surface pattern. K-means clustering rationalized the smoother topography zones.',
    impact: [
      'TSP ordering turned unstructured points into a single continuous milling path',
      'Tool angle depends on path order, so the ordering produced an emergent surface texture',
      'Aligned timber grain with principal stress lines using Karamba3D beam packing'
    ],
    technologies: ['Robotic Milling', 'TSP', 'K-Means Clustering', 'Karamba3D'],
    categories: ['fabrication', 'software'],
    metrics: { primary: 'TSP', secondary: 'Toolpath Ordering' },
    gallery: [
      {
        src: 'images/robotic-timber-milling_texture.jpeg',
        caption: 'Milled textures: K-means clustered topography (left) beside the TSP-ordered point pattern (right).'
      },
      {
        src: 'images/robotic-timber-milling_diagram.jpg', 
        caption: 'Beam packing: timber grain aligned with principal stress lines in Karamba3D.'
      },
      {
        src: 'images/robotic-timber-milling_rough.gif', 
        caption: 'Roughing pass: larger bits remove stock before the finishing toolpath.'
      }
    ]
  },
  'bioreceptive-wall': {
    title: 'Bioreceptive Living Wall',
    subtitle: 'Vertico & TU Delft — Research Collaboration',
    year: '2023',
    image: 'images/bioreceptive-wall_moss-texture.jpg',
    alt: 'Textured 3D-printed concrete surface hosting living moss.',
    description: "Moss could cool facades through evapotranspiration, but standard concrete gives it nowhere to take hold. Set up a research collaboration with TU Delft PhD researcher Max Veeger to test printed concrete's layered texture as a moss substrate. The demonstrator panel sustained living moss under indoor conditions with occasional wetting, and the work continued as a master's thesis.",
    impact: [
      'Demonstrator panel sustained living moss indoors with occasional wetting',
      'Initiated the Vertico–TU Delft collaboration; served on the follow-up thesis committee',
      'Now growing into a joint research proposal to scale the system toward market'
    ],
    technologies: ['3DCP', 'Bioreceptivity', 'Surface Texture', 'Evapotranspiration'],
    categories: ['fabrication'],
    metrics: { primary: 'Moss', secondary: 'Sustained Growth' }
  },
  'overhang-printing': {
    title: 'Overhangs Beyond 90°',
    subtitle: 'Vertico & SIKA — Material R&D',
    year: '2022',
    image: 'images/overhang-printing_abstract-concrete.webp',
    alt: 'An abstract, flowing concrete form with a steep unsupported overhang.',
    description: "Wet concrete deforms under the next layer's weight, which caps how far a print can lean. A two-year material collaboration with SIKA produced controlled-setting mixes for Vertico's set-on-demand system, so setting happens on command rather than on the mix's own clock. The result is overhangs beyond 90 degrees, geometry that was unprintable five years earlier.",
    impact: [
      'Controlled-setting mixes print overhangs beyond 90° without support material',
      'Binder content cut by 65% in the same material programme',
      'Embodied carbon down by up to 80% on realised projects'
    ],
    technologies: ['3DCP', 'Set-on-Demand', 'Controlled-Setting Mixes', 'Material Development'],
    categories: ['fabrication'],
    metrics: { primary: '90°+', secondary: 'Overhang Angle' }
  },
  'technoledge': {
    title: 'Interactive Bio-Pavilion',
    subtitle: 'TU Delft — Interactive Design',
    year: '2018',
    image: 'images/interactive Bio-Pavilion.webp',
    alt: 'An interactive light installation within a woven pavilion structure.',
    description: "A pavilion woven from hemp and bone glue needed a way to respond to the people walking under it. As part of the interaction team, connected an Xbox Kinect to Arduino-driven LEDs: hand positions are tracked as points in space, and each light's intensity follows its proximity to them. Exhibited at full scale in Prague, the pavilion drew visitors into movement — some danced with it.",
    impact: [
      "Kinect hand tracking drives each LED's intensity by proximity in 3D space",
      'Pavilion built from woven hemp and bone glue, a bio-based composite',
      'Exhibited at full scale on a university campus in Prague'
    ],
    technologies: ['Kinect', 'Arduino', 'Motion Tracking', 'HCI', 'Bio-Composites'],
    categories: ['software', 'fabrication'],
    metrics: { primary: 'Kinect', secondary: 'Hand Tracking' }
  },
  'zero-energy-mooc': {
    title: 'Zero-Energy Design MOOC',
    subtitle: 'TU Delft — Freelance Course Author',
    year: '2019',
    image: 'images/zero-energy-mooc_course-hero.jpg',
    alt: 'Digital course interface showing zero-energy building concepts and energy analysis modules.',
    description: 'Co-authored the content of TU Delft\'s "Zero-Energy Design" MOOC, a seven-week course spanning passive and active energy reduction, energy reuse, and on-site production. Free on edX, it reaches 30,000+ learners a year. In 2020 the course won the edX Prize for Exceptional Contributions in Online Teaching, selected from 10 finalists out of 3,000+ edX courses.',
    impact: [
      'Course won the 2020 edX Prize, selected from 10 global finalists among 3,000+ courses',
      'Reaches 30,000+ learners a year, 25,594 of them enrolled on edX',
      'Written freelance alongside a building-physics teaching position at TU Delft'
    ],
    technologies: ['Building Physics', 'Energy Modeling', 'Curriculum Design', 'edX'],
    categories: ['structural'],
    metrics: { primary: '30,000+', secondary: 'Learners per Year' }
  },
  'vertico-training': {
    title: '3DCP Training Program',
    subtitle: 'Vertico — Curriculum & Delivery',
    year: '2021',
    image: 'images/vertico-training_workshop.jpg',
    alt: 'A technical workshop session teaching parametric design principles for concrete printing.',
    description: 'Clients who buy a printer or slicer still have to learn to design for it: printable geometry follows strict manufacturing rules. Built Vertico\'s three-day training program covering parametric modeling, design-for-manufacturing rules, slicing, and on-site robot operation. Colleagues now deliver the standard program while I curate the curriculum and teach the advanced sessions.',
    impact: [
      'Trained 20+ companies and universities in parametric design, slicing, and robotic fabrication',
      'Three-day format ending in hands-on robot operation on site',
      'Standard program now delivered by the wider team; advanced trainings remain mine'
    ],
    technologies: ['Rhino', 'Grasshopper', 'DfM', 'Robot Operation', 'Curriculum Design'],
    categories: ['software'],
    metrics: { primary: '20+', secondary: 'Organizations Trained' }
  },
  'placemaking-vr': {
    title: 'VR for Urban Decision-Making',
    subtitle: 'BFAS — Visualization',
    year: '2017',
    image: 'images/placemaking-vr_workshop.jpg',
    alt: 'User wearing a VR headset experiencing an urban design study at eye level.',
    description: 'A proposed building-height increase had stalled: 2D solar studies could not convey its impact to the client and municipality. Modeling the project in Revit and bringing stakeholders into VR through Enscape let them experience the shadows at eye level, and the standstill broke. Presented the approach at Placemaking Week 2017, when eye-level VR review was still uncommon.',
    impact: [
      'VR solar studies broke a planning standstill where 2D drawings had failed',
      'Argued at Placemaking Week 2017 for eye-level VR review, before it became common practice',
      "Approach later used to show Amsterdam's municipality streets with and without added greenery"
    ],
    technologies: ['VR', 'Enscape', 'Revit', 'Solar Studies', 'Urban Design'],
    categories: ['software'],
    metrics: { primary: '1:1', secondary: 'Eye-Level Scale' }
  },
};