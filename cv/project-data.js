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
    subtitle: 'Vertico & TU/e — Hybrid Construction',
    year: '2021',
    image: 'images/printed-formwork_concrete-rebar.webp',
    alt: 'A concrete column with internal steel reinforcement, cast within a 3D-printed shell.',
    description: 'Used 3D-printed shells as permanent, lost formwork for conventionally cast, steel-reinforced columns. This hybrid method overcomes reinforcement challenges in 3DCP, enabling efficient and geometrically complex structural shapes.',
    impact: [
      'Developed a viable hybrid construction method combining 3DCP and cast concrete',
      'Enabled complex geometries like integrated column heads at no extra cost',
      'Structurally validated at TU/e, proving the printed-cast interface remained intact'
    ],
    technologies: ['3DCP', 'Formwork', 'Reinforced Concrete', 'Hybrid Construction', 'Structural Testing'],
    categories: ['fabrication'],
    metrics: { primary: 'Hybrid', secondary: 'Construction' }
  },
  'design-by-testing': {
    title: 'Design-by-Testing Bench',
    subtitle: 'Vertico — Structural Validation',
    year: '2021',
    image: 'images/design-by-testing_load-test.webp',
    alt: 'A creatively designed concrete bench undergoing a physical load test with over 1000kg of weight.',
    description: "Translated an artistic design from Kiki & Joost into a feasible structural concept for a museum bench. Utilized a \"design-by-testing\" approach to validate the unreinforced structure's strength and integrity.",
    impact: [
      'Successfully translated an artistic concept into an engineered, printable object',
      'Proved a load capacity of over 1,000 kg through physical testing',
      'Optimized the design to transfer loads through compression, removing the need for steel reinforcement'
    ],
    technologies: ['3DCP', 'Structural Testing', 'Prototyping', 'Design Engineering', 'Compression Structures'],
    categories: ['fabrication', 'structural'],
    metrics: { primary: '1,000kg', secondary: 'Load Tested' }
  },
  'disassemblable-beam': {
    title: 'Disassemblable Beam',
    subtitle: 'Vertico — Circular Design',
    year: '2022',
    image: 'images/disassemblable-beam_interlocking-segments.webp',
    alt: 'Modular, interlocking components of a post-tensioned beam, demonstrating design for disassembly.',
    description: 'rationalized the design of a disassemblable beamm, composed of five interlocking segments with double-curved dry joints. The project demonstrates circular construction principles, enabling easy disassembly and reuse.',
    impact: [
      'Demonstrated a successful "Design for Disassembly" approach in concrete',
      'Engineered high-precision, non-planar interlocking joints for a perfect fit',
      'Pioneered a method to print non-planar surfaces on both sides of a component'
    ],
    technologies: ['3DCP', 'Circular Economy', 'Dry Joints', 'Non-Planar Printing', 'Post-Tensioning'],
    categories: ['fabrication', 'structural'],
    metrics: { primary: '5', secondary: 'Segments' }
  },
  'hexastone-pavilion': {
    title: '3D-Printed Concrete Pavilion',
    subtitle: 'Vertico — Fabrication Lead',
    year: '2022',
    image: 'images/hexastone-pavilion_concrete-blocks.webp',
    alt: 'An assembly of 106 unique 3D-printed hexagonal concrete blocks forming a complex shell structure.',
    description: 'Oversaw the complete design-to-fabrication process for a discrete shell structure of 106 unique 3D-printed stones. The project demonstrates how material is used efficiently in its primary strength, where form follows force.',
    impact: [
      'Printed 106 unique components in just two days, with a 7-minute average print time',
      'Achieved a high manufacturing precision of 0.5mm tolerance per panel',
      'Managed an efficient workflow for a force-following discrete structural system'
    ],
    technologies: ['3DCP', 'Robotic Automation', 'Parametric Design', 'Digital Fabrication'],
    categories: ['fabrication'],
    metrics: { primary: '106', secondary: 'Unique Elements' }
  },
  'concrete-canoe': {
    title: '3D Printed Concrete Canoe',
    subtitle: 'Vertico — Applied R&D',
    year: '2022',
    image: 'images/concrete-canoe_floating.jpg',
    alt: 'A watertight 3D-printed concrete canoe floating on water with two occupants.',
    description: 'Engineered a functional, watertight concrete canoe by adapting ancient Nubian vaulting techniques to robotic fabrication. By orienting the print plane at a 45-degree inclination, the process overcame standard gravity constraints, enabling effective horizontal spans (100% overhangs) without support structures.',
    impact: [
      'Adapted ancient Nubian vaulting principles to solve modern layer-deformation constraints',
      'Achieved a continuous 45-degree print inclination, enabling unsupported horizontal geometry',
      'Validated structural buoyancy for a 250kg payload (two adults + cargo) with a 1.5 safety factor'
    ],
    technologies: ['Inclined Slicing', 'Nubian Vaults', 'Buoyancy Calc', '3DCP', 'Structural Design'],
    categories: ['fabrication'],
    metrics: { primary: '45°', secondary: 'Print Inclination' }
  },
  'nonplanar-facade': {
    title: 'Non-Planar Facade Panels',
    subtitle: 'Vertico & TU/e — Collaboration',
    year: '2023',
    image: 'images/nonplanar-facade_curved-panels.webp',
    alt: 'A modern building facade featuring curved, organic panels with a smooth, non-layered finish.',
    description: 'Led the fabrication of complex facade panels using non-planar toolpaths on robotically shaped sand formwork. This innovative approach eliminates wasteful molds and achieves smooth, organic surfaces for architectural applications.',
    impact: [
      'Produced an architectural-grade, smooth non-layered surface finish',
      'Eliminated the need for expensive and wasteful custom molds',
      'Supervised printing and sand-forming processes in a key industry-academia collaboration'
    ],
    technologies: ['Non-Planar Printing', 'Sand Formwork', 'Rapid code generation', 'Facade Systems', 'Robotics'],
    categories: ['fabrication'],
    metrics: { primary: 'Smooth', secondary: 'Surface Finish' }
  },
  'efficient-bench': {
    title: 'Material-Efficient Bench',
    subtitle: 'Vertico — Sustainable Application',
    year: '2021',
    image: 'images/efficient-bench_curved-concrete-bench.webp',
    alt: "A smoothly curved 22-meter concrete retaining wall and bench in a children's playground.",
    description: "Oversaw the design and fabrication of a 22-meter curved retaining wall and bench for a playground. The structure was printed hollow, showcasing a prime example of sustainable and mass-customized 3D concrete printing.",
    impact: [
      'Reduced material usage by over 90% and emissions by over 40%',
      'Integrated varying seating heights for children and adults at no extra cost',
      'Successfully delivered a large-scale, functional piece of public furniture'
    ],
    technologies: ['3DCP', 'Sustainable Design', 'Public Furniture', 'Mass Customization'],
    categories: ['fabrication'],
    metrics: { primary: '90%', secondary: 'Material Saved' }
  },
  'manhole-finishing': {
    title: 'Robotic Manhole Finishing',
    subtitle: 'Vertico — Industrial Automation',
    year: '2023',
    image: 'images/manhole-finishing_robot-arm.webp',
    alt: 'An industrial robot arm with a specialized tool finishing the interior of a large concrete pipe.',
    description: 'Developed an innovative, automated robotic post-processing method for the interior of 3D-printed concrete manholes. This solution solved a key production bottleneck by enabling smooth finishing inside existing manhole pits.',
    impact: [
      'Eliminated a critical production bottleneck, enabling industrial-scale application',
      'Created a fully automated finishing process with a specialized robotic tool',
      'Successfully integrated 3D printing into existing industrial fabrication lines'
    ],
    technologies: ['3DCP', 'Robotics', 'Post-Processing', 'Automation', 'Toolpath Generation'],
    categories: ['fabrication'],
    metrics: { primary: 'Industrial', secondary: 'Scale' }
  },
  'algorithmic-timber-milling': {
    title: 'Algorithmic Timber Milling',
    subtitle: 'TU Delft — Robotic Fabrication',
    year: '2019',
    image: 'images/robotic-timber-milling_fabrication.gif', // Placeholder
    alt: 'CNC milled timber block displaying two distinct textures: a smooth topographic surface and a chaotic, noise-based texture.',
    description: 'Investigated computational strategies to convert unstructured geometric data into continuous robotic toolpaths. To solve the inefficiency of milling raw point clouds, the Traveling Salesman Problem (TSP) algorithm was implemented to organize random set points into a single, continuous path, minimizing machine airtime. This was contrasted with a K-Means clustering approach to segment and smooth complex surface topographies.',
    impact: [
      'Solved the "airtime" inefficiency of milling unstructured point clouds by organizing toolpaths via the Traveling Salesman Algorithm',
      'Implemented K-Means clustering to rationalize complex surface curvature into distinct, machine-readable milling zones',
      'Developed a theoretical beam-packing framework (Karamba3D) to align timber anisotropy with force vectors, informing the stock material assembly'
    ],
    technologies: ['Robotic Milling', 'Traveling Salesman Algo', 'K-Means Clustering', 'Karamba3D', 'Python'],
    categories: ['fabrication', 'software'],
    metrics: { primary: 'TSP', secondary: 'Path Optimization' },
    gallery: [
      {
        src: 'images/robotic-timber-milling_texture.jpeg',
        caption: 'Algorithmic Textures: Comparison of K-Means clustering for smooth topography (left) vs. TSP optimization for continuous processing of unstructured data (right).'
      },
      {
        src: 'images/robotic-timber-milling_diagram.jpg', 
        caption: 'Beam Packing Logic: Computational analysis using Karamba3D to align wood grain direction with internal stress vectors.'
      },
      {
        src: 'images/robotic-timber-milling_rough.gif', 
        caption: 'Robotic Fabrication: Rough material removal, using larger bits to quickly approach the final geometry.'
      }
    ]
  },
  'bioreceptive-wall': {
    title: 'Bioreceptive Living Wall',
    subtitle: 'Vertico & TU Delft — Ecological Research',
    year: '2023',
    image: 'images/bioreceptive-wall_moss-texture.jpg',
    alt: 'Textured 3D-printed concrete surface successfully hosting various types of moss.',
    description: 'Led a collaborative research initiative to prove that 3D-printed concrete can host various types of mosses. The project resulted in a successful demonstrator showcasing active biological growth, validating the potential of using natural evapotranspiration to combat the Urban Heat Island effect.',
    impact: [
      'Kickstarted an R&D initiative that successfully validated 3DCP as a viable substrate for biological growth',
      'Demonstrated the potential for passive urban cooling through natural evapotranspiration by optimizing surface biomarkers',
      'Translated industrial research into an academic track, serving on the committee for the continued Master\'s thesis'
    ],
    technologies: ['Bioreceptivity', 'Evapotranspiration', 'Urban Heat Island', 'Surface Topology', 'Material Science'],
    categories: ['research', 'fabrication'],
    metrics: { primary: 'Passive', secondary: 'Urban Cooling' }
  },
  'overhang-printing': {
    title: 'Advanced Overhang Printing',
    subtitle: 'Vertico — R&D',
    year: '2022',
    image: 'images/overhang-printing_abstract-concrete.webp',
    alt: 'An abstract, flowing concrete form with a dramatic unsupported overhang, inspired by Nubian vaults.',
    description: 'Pioneered a technique for printing concrete at a 45-degree angle to create extreme overhangs without support structures. This method, inspired by traditional Nubian vaults, dramatically expands the geometric freedom of 3D concrete printing.',
    impact: [
      'Achieved a 100% effective overhang angle without any support material',
      'Expanded geometric possibilities for creating new architectural forms',
      'Demonstrated how traditional construction methods can inspire advanced manufacturing'
    ],
    technologies: ['3DCP', 'R&D', 'Toolpath Generation', 'Digital Fabrication'],
    categories: ['fabrication'],
    metrics: { primary: '45°', secondary: 'Print Angle' }
  },
  'technoledge': {
    title: 'Interactive Bio-Pavilion',
    subtitle: 'TU Delft — Interactive Fabrication',
    year: '2018',
    image: 'images/interactive Bio-Pavilion.webp',
    alt: 'An interactive light installation within a modern architectural structure.',
    description: 'In a 40+ person collaboration, developed the human-computer interaction (HCI) for a robotically woven bio-composite pavilion. Employed motion-tracking to enable visitors to engage with 46 embedded LEDs.',
    impact: [
      'Created a dynamic and immersive visitor experience through interactive lighting',
      'Successfully integrated motion-tracking sensors with custom Arduino electronics',
      'Contributed to a large-scale international project, blending advanced fabrication with HCI'
    ],
    technologies: ['HCI', 'Motion Tracking', 'Robotic Weaving', 'Arduino', 'LED Integration'],
    categories: ['software', 'fabrication'],
    metrics: { primary: '46', secondary: 'Interactive LEDs' }
  },
  'zero-energy-mooc': {
    title: 'Zero-Energy Design MOOC',
    subtitle: 'TU Delft — Educational Content',
    year: '2019',
    image: 'images/zero-energy-mooc_course-hero.jpg',
    alt: 'Digital course interface showing zero-energy building concepts and energy analysis modules.',
    description: 'Co-developed a Massive Open Online Course (MOOC) focused on sustainable building physics. Translated complex energy-neutrality strategies into accessible, actionable modules, bridging the gap between theoretical analysis and practical architectural application.',
    impact: [
      'Won the 2020 "edX Prize for Exceptional Contributions in Online Teaching and Learning"',
      'Disseminated advanced sustainable engineering methodologies to a global audience of professionals',
      'Formulated technical modules integrating building physics with design decision-making',
    ],
    technologies: ['Building Physics', 'Sustainability', 'Energy Modeling', 'Curriculum Design', 'Zero-Energy'],
    categories: ['structural'],
    metrics: { primary: 'Global', secondary: 'Learner Reach' }
  },
  'vertico-training': {
    title: 'Training 3DCP, Parametric design',
    subtitle: 'Vertico — Client Enablement',
    year: '2021',
    image: 'images/vertico-training_workshop.jpg',
    alt: 'A technical workshop session teaching parametric design principles for concrete printing.',
    description: 'Developed a specialized technical curriculum on Parametric Design and Design for Manufacturing (DfM) for 3D Concrete Printing. This initiative bridged the critical hardware-software skills gap, enabling clients to transition from basic operation to independent, complex geometric production.',
    impact: [
      'Trained over 40 organizations, including 15+ universities, facilitating widespread technology adoption',
      'Systemized personal expertise into a scalable educational module now delivered by the wider team',
      'Empowered users to master strict DfM constraints required for successful robotic fabrication'
    ],
    technologies: ['Rhino', 'Grasshopper', 'DfM', 'Education', 'Knowledge Transfer'],
    categories: ['software'],
    metrics: { primary: '40+', secondary: 'Organizations Trained' }
  },
  'placemaking-vr': {
    title: 'VR Urban Experience',
    subtitle: 'BFAS — Placemaking Week',
    year: '2017',
    image: 'images/placemaking-vr_workshop.jpg',
    alt: 'User wearing a VR headset participating in an urban design workshop.',
    description: 'Represented BFAS at the international Placemaking Week 2017, leading a workshop on immersive urban analysis. The initiative demonstrated how Virtual Reality shifts planning from abstract birds-eye views to a human-centric "City at Eye Level" perspective, validating public space quality and spatial equity before construction.',
    impact: [
      'Represented BFAS at a global forum focusing on community-driven public space innovation',
      'Demonstrated the value of 1:1 scale immersion to prioritize the human experience in urban planning',
      'Advocated for VR as a critical tool to validate spatial equity and design impact'
    ],
    technologies: ['Virtual Reality', 'Urban Design', 'Public Space', 'Visualization', 'Participatory Design'],
    categories: ['software'],
    metrics: { primary: 'International', secondary: 'Conference' }
  },
};