/**
 * project-data.js
 * ============================================================================
 * SINGLE SOURCE OF TRUTH FOR PORTFOLIO PROJECTS
 * ============================================================================
 * This file contains the complete data for all portfolio projects. To add,
 * remove, or edit a project, simply modify the corresponding object in this

 * file. The main application will automatically re-render the portfolio grid.
 *
 * PROFESSIONAL RECOMMENDATION:
 * For a live production website, it is strongly recommended to host these images
 * locally within your project. This prevents broken images if the source changes,
 * improves loading performance, and gives you control over image optimization.
 * ============================================================================
 */

export const projectData = {
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
    categories: ['computational', 'research'],
    metrics: { primary: '60-80%', secondary: 'Footprint Reduction' }
  },
  'mega-highrise': {
    title: 'Highrise Timber Diagrid',
    subtitle: 'TU Delft — Most Innovative Design Award',
    year: '2018',
    image: 'images/mega-highrise_timber-tower.webp',
    alt: 'A model of a tall skyscraper with a wooden diagrid structural system.',
    description: 'As a structural engineer in an interdisciplinary team, designed a 169m sustainable tower with a wooden diagrid. Used a derivative-free algorithm to optimize structural angles and cross-sections, significantly reducing the carbon footprint.',
    impact: [
      'Won the "Most Innovative Design Award" from Stichting Hoogbouw',
      'Engineered a hybrid structure with 70% wood composition',
      'Successfully passed all ultimate and serviceability limit states'
    ],
    technologies: ['Karamba3D', 'FEA', 'Structural Optimization', 'Parametric Modeling', 'Hybrid Structures'],
    categories: ['computational', 'research'],
    metrics: { primary: '169m', secondary: 'Tower Height' }
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
    categories: ['research', 'computational'],
    metrics: { primary: '3 N/mm²', secondary: 'Compression Strength' }
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
    categories: ['fabrication', 'research'],
    metrics: { primary: '46', secondary: 'Interactive LEDs' }
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
    categories: ['fabrication', 'research'],
    metrics: { primary: '106', secondary: 'Unique Elements' }
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
    categories: ['fabrication', 'research'],
    metrics: { primary: '45°', secondary: 'Print Angle' }
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
    technologies: ['Non-Planar Printing', 'Sand Formwork', 'G-Code', 'Facade Systems', 'Robotics'],
    categories: ['fabrication', 'computational'],
    metrics: { primary: 'Smooth', secondary: 'Surface Finish' }
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
    categories: ['fabrication', 'computational'],
    metrics: { primary: 'Hybrid', secondary: 'Construction' }
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
    categories: ['fabrication', 'computational'],
    metrics: { primary: '5', secondary: 'Segments' }
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
    categories: ['fabrication', 'research'],
    metrics: { primary: '1,000kg', secondary: 'Load Tested' }
  }
};