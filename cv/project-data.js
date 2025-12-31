export const projectData = {
  // -------------------------------------------------------------------------
  // CATEGORY: STRUCTURAL ENGINEERING
  // -------------------------------------------------------------------------
  'mega-highrise': {
    title: 'Highrise Timber Diagrid',
    subtitle: 'TU Delft — Most Innovative Design Award',
    year: '2018',
    image: 'images/mega-highrise_timber_Render_2.png',
    alt: 'A model of a tall skyscraper with a wooden diagrid structural system.',
    description: 'As a structural engineer in an interdisciplinary team, designed a 169m sustainable tower with a wooden diagrid. Used a derivative-free algorithm to optimize structural angles and cross-sections, significantly reducing the carbon footprint.',
    impact: [
      'Won the "Most Innovative Design Award" from Stichting Hoogbouw',
      'Engineered a hybrid structure with 70% wood composition',
      'Successfully passed all ultimate and serviceability limit states'
    ],
    technologies: ['Karamba3D', 'FEA', 'Structural Optimization', 'Parametric Modeling', 'Hybrid Structures'],
    categories: ['structural'],
    metrics: { primary: '169m', secondary: 'Tower Height' },
    gallery: [
      {
        src: 'images/mega-highrise_timber_Render_2.png',
        caption: 'Global View: The diagrid structure optimizes material usage by following principal stress lines.'
      },
      {
        src: 'images/mega-highrise_timber_Render_1.png', 
        caption: 'Node Detail: A hybrid steel-timber connection designed to withstand high wind loads at 100m+ elevation.'
      },
      {
        src: 'images/mega-highrise_construction.jpg', 
        caption: 'Phased Construction: Computational analysis of stability during the erection sequence.'
      }
    ]
  },
  'biosphere-optimization': {
    title: 'Biosphere Structural Design',
    subtitle: 'Vertico & TU Delft & Eigenraam engineering — Structural design',
    year: '2024',
    image: 'images/biosphere-optimization_fem-analysis.jpg',
    alt: 'Finite element analysis visualization of a 5-meter spherical structure composed of hexagonal concrete elements.',
    description: 'Acted as the technical bridge between artistic design and structural engineer for a 5-meter 3D printed concrete sphere. Developed the parametric logic to generate direct inputs for FEM analysis (RFEM), allowing the structural engineer to validate the unreinforced, epoxy-bonded shell based on real-world material data.',
    impact: [
      'Generated the parametric models to quickly iterate between various design alternatives, automating the design to structural calculation workflow',
      'Quantified material properties through physical testing, generating the required material values for the structural analysis',
      'Rationalized the print geometry to balance a 40% lightweight infill with necessary structural flange stiffness'
    ],
    technologies: ['Parametric Design', 'RFEM', 'Structural Analysis', 'Material Testing', '3DCP'],
    categories: ['structural', 'fabrication'],
    metrics: { primary: '5m', secondary: 'Span Diameter' }
  },
  'floor-optimization': {
    title: 'Floorslab Optimization',
    subtitle: "TU Delft — Master's Thesis",
    year: '2020',
    image: 'images/floor-optimization_concrete-shell.webp',
    alt: 'Optimized thin-shell concrete floor slab, demonstrating efficient structural form.',
    description: "Developed a derivative-free, fabrication-aware optimization methodology for thin-shell flooring systems. The approach combines shape and size optimization to drastically reduce the environmental impact of concrete construction.",
    impact: [
      'Achieved a 60-80% reduction in environmental footprint compared to conventional floors',
      'Demonstrated high efficiency by prioritizing axial force distribution',
      'Validated results through a comprehensive Life-Cycle Analysis (LCA)'
    ],
    technologies: ['Optimization', 'FEA', 'Life-Cycle Analysis', 'Parametric Design', 'Concrete Structures'],
    categories: ['structural'], 
    metrics: { primary: '60-80%', secondary: 'Footprint Reduction' }
  },
  'earthy-vault': {
    title: 'Earthy Vault Optimization',
    subtitle: 'TU Delft — Humanitarian Design',
    year: '2019',
    image: 'images/compression-testing-earthy-vault.webp',
    alt: 'Compression testing of an adobe brick reinforced with straw.',
    description: 'Developed an optimized ribbed vault shelter system for refugee camps using local, weak materials. The process integrated hands-on material tests of straw-reinforced adobe with computational analysis to inform the design.',
    impact: [
      'Directly linked physical material testing to the computational optimization loop',
      'Created a community-buildable design using local materials and techniques',
      'Developed a comprehensive, IKEA-style manual for easy assembly'
    ],
    technologies: ['Material Testing', 'Dynamic Relaxation', 'FEA', 'Humanitarian Engineering', 'Computational Design'],
    categories: ['structural'], 
    metrics: { primary: '3 N/mm²', secondary: 'Compression Strength' }
  },

  // -------------------------------------------------------------------------
  // CATEGORY: SOFTWARE & TOOLS
  // -------------------------------------------------------------------------
  'vertico-slicer': {
    title: 'Vertico Slicer Plugin',
    subtitle: 'Vertico — Software Development',
    year: '2021',
    image: 'images/vertico-slicer_toolpath-simulation.jpg',
    alt: 'Grasshopper interface visualizing simultaneous toolpaths for multiple non-planar geometries.',
    description: 'Engineered a proprietary CAM solution for 6-axis robotic printing, overcoming standard 3-axis slicing limitations. The software enables simultaneous batch processing of multiple geometries and generates complex non-planar toolpaths, unlocking industrial-scale efficiency and unrestricted geometric freedom.',
    impact: [
      'Automated the simultaneous slicing of multiple objects to maximize production throughput',
      'Enabled the execution of complex non-planar toolpaths specifically for 6-axis kinematics',
      'Eliminated dependencies on commercial software by internalizing Robotcode generation'
    ],
    technologies: ['Grasshopper', 'C# development', '6-Axis Robotics', 'Robotics', 'Computational Geometry'],
    categories: ['software', 'fabrication'],
    metrics: { primary: '6-Axis', secondary: 'Non-Planar Logic' }
  },
  'vasecreator-web-platform': {
    title: 'Web-Based Parametric Configurator',
    subtitle: 'Independent Developer — Full Stack Product',
    year: '2025',
    image: 'images/vasecreator-web-platform_ui-render.gif',
    alt: 'User interface of a web-based parametric design tool displaying a generated 3D vase geometry.',
    description: 'Engineered a standalone parametric design tool featuring a lightweight, client-side geometry engine. This zero-dependency architecture enables thousands of users to generate production-ready, watertight meshes directly in the browser, eliminating server-side computation costs while securing top-tier organic search rankings.',
    impact: [
      'Engineered a zero-dependency procedural geometry engine ensuring consistent manifold topology for 12,000+ annual users',
      'Scaled a production-grade application with 100% client-side execution, reducing cloud compute costs to zero',
      'Achieved top 3 global search rankings by optimizing UI latency to under 16ms'
    ],
    technologies: ['Three.js', 'WebGL', 'Procedural Geometry', 'JavaScript', 'Product Management'],
    categories: ['software'],
    metrics: { primary: '1,000+', secondary: 'Monthly Users' }
  },
  'vertico-hub-platform': {
    title: 'SaaS Licensing Infrastructure',
    subtitle: 'Vertico — Cloud Architecture',
    year: '2023',
    image: 'images/vertico-hub-platform_dashboard.jpg',
    alt: 'Web-based dashboard interface for managing software licenses and user subscriptions.',
    description: 'Architected the full-stack infrastructure to transition Vertico’s proprietary software into a scalable SaaS product. Built a secure REST API on Google Cloud Run to validate Rhino/Grasshopper sessions against a central database, enabling real-time license management for sales teams and end-users.',
    impact: [
      'Operationalized a Recurring Revenue (SaaS) model by centralizing software license control',
      'Engineered a secure cloud-to-desktop bridge, validating Grasshopper plugins via Google Cloud Run',
      'Automated the sales-to-activation workflow, reducing administrative overhead for the internal team'
    ],
    technologies: ['Google Cloud', 'REST API', 'SaaS', 'Grasshopper', 'Full Stack'],
    categories: ['software'],
    metrics: { primary: 'SaaS', secondary: 'Business Model' }
  },
  'optimized-foundation': {
    title: 'Automated Foundation Configurator',
    subtitle: 'Vertico — Industrial R&D',
    year: '2023',
    image: 'images/optimized-foundation_ribbed-structure.jpg',
    alt: 'A topologically optimized, rib-stiffened 3D-printed concrete foundation block.',
    description: 'Engineered an automated design-to-production pipeline replacing standard cast foundations with structurally-optimized 3D-printed alternatives. The system links a web-based configurator directly to robotic Rapid code (ABB) generation, reducing concrete consumption by 70-90% through load-specific geometry.',
    impact: [
      'Automated the engineering workflow by linking web-based inputs directly to robotic toolpath generation',
      'Achieved 70-90% material savings by tailoring geometry strictly to structural load requirements',
      'Validated the system as a TRL 5 demonstrator, proving feasibility for industrial infrastructure'
    ],
    technologies: ['Structural Optimization', 'Web Configurator', '3DCP', 'Automated Workflow', 'Rapid Code Generation'],
    categories: ['software', 'fabrication', 'structural'],
    metrics: { primary: '70-90%', secondary: 'Material Reduction' }
  },
  'parametric-bench-configurator': {
    title: 'Parametric Bench Configurator',
    subtitle: 'Vertico — Mass Customization',
    year: '2023',
    image: 'images/parametric-bench-configurator_curved-seating.jpg',
    alt: 'A customizable 3D-printed concrete bench with a ribbed texture and organic curves.',
    description: 'Developed a full-stack design-to-fabrication pipeline for customizable public benches. The web-based configurator enables clients to manipulate geometric parameters, which in turn instantly generates the fabrication files for the bench, taking into account manufacturing constraints. Thereby eliminating engineering lead times, enabling cost-effective fabrication of public furniture.',
    impact: [
      'Compressed design-to-production lead times from weeks to mere hours via automated file generation',
      'Enabled cost-effective mass customization, removing the need for unique molds per iteration',
      'Integrated specific fabrication constraints into the algorithmic logic to ensure structural integrity'
    ],
    technologies: ['Web Configurator', 'Parametric Design', '3DCP', 'Rapid code', 'Mass Customization'],
    categories: ['software', 'fabrication'],
    metrics: { primary: 'Hours', secondary: 'Design-to-Print' }
  },

  // -------------------------------------------------------------------------
  // CATEGORY: DIGITAL FABRICATION
  // -------------------------------------------------------------------------
  'zaha-hadid-aevum': {
    title: 'Aevum Pavilion',
    subtitle: 'Vertico, ZHA & EOC — Structural Fabrication',
    year: '2024',
    image: 'images/zaha-hadid-aevum_corner-detail.jpg',
    alt: 'Complex 3D-printed concrete corner node with internal post-tensioning channels.',
    description: "Translated 2D structural drawings from Eckersley O'Callaghan into a feasible 3D post-tensioning system for the Aevum pavilion, designed by Zaha Hadid Architects. Engineered the complex internal geometry of critical corner nodes where multiple ducts intersect, utilizing non-planar slicing.",
    impact: [
      'Resolved complex internal collisions where dual post-tensioning ducts crossed within a single node',
      'Implemented non-planar, variable layer height slicing to ensure duct alignment without support',
      'Delivered high-precision structural components under a critical deadline for an industry-leading client'
    ],
    technologies: ['Post-Tensioning', 'Structural design', 'Complex Topology', 'Parametric design', 'Concrete'],
    categories: ['fabrication'],
    metrics: { primary: 'Crossing', secondary: 'Internal Ducts' }
  },
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
    description: 'Designed and printed a two-meter, post-tensioned beam composed of five interlocking segments with double-curved dry joints. The project demonstrates circular construction principles, enabling easy disassembly and reuse.',
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
  'HPA-pavilion': {
    title: 'Formwork-Free Shell Pavilion',
    subtitle: 'De Huizenprinters — Fabrication Lead',
    year: '2022',
    image: 'images/huizenprinters-pavilion_assembled-shell.jpg',
    alt: 'A segmented, vault-shaped concrete pavilion assembled from 3D-printed parts without internal molds.',
    description: 'Orchestrated the complete fabrication logic for a compression-only concrete vault, translating a parametric shell design into printable reality. By segmenting the constant-stress arch into eight double-curved parts with integrated stiffening ribs, the project eliminated the need for reinforcement and wasteful single-use support structures.',
    impact: [
      'Eliminated 100% of single-use formwork and falsework by engineering a self-supporting assembly method',
      'Solved critical buckling and shrinkage issues by integrating structural ribs directly into the print path',
      'Segmented a complex monolithic geometry into 8 printable components, bridging design and production'
    ],
    technologies: ['3DCP', 'Shell Structures', 'Segmentation', 'Sustainable Construction', 'Parametric Design'],
    categories: ['fabrication', 'structural'],
    metrics: { primary: 'Zero', secondary: 'Single-Use Formwork' }
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