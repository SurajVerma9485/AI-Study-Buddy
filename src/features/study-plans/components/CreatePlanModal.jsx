import React, { useState } from 'react';
import Modal, { ModalBody, ModalFooter } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import studyPlanService from '../services/studyPlanService';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  FileText,
  Layers,
  Zap,
} from 'lucide-react';

const CLASSES = ['Class 10', 'Class 9', 'Class 11', 'Class 12'];

const SUBJECTS = {
  'Class 10': ['Mathematics', 'Science', 'English'],
  'Class 9': ['Mathematics', 'Science', 'English'],
  'Class 11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
  'Class 12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
};

// Comprehensive chapter listings for Class 9-12 based on standard NCERT/CBSE curriculum
const CHAPTERS = {
  'Class 9': {
    Mathematics: [
      { id: 'c9-m1', name: 'Chapter 1 - Number Systems', description: 'Irrational numbers, real numbers, decimal expansions & laws of exponents' },
      { id: 'c9-m2', name: 'Chapter 2 - Polynomials', description: 'Zeroes of polynomial, remainder theorem, factorisation & algebraic identities' },
      { id: 'c9-m3', name: 'Chapter 3 - Coordinate Geometry', description: 'Cartesian plane, coordinates of a point & plotting on graph' },
      { id: 'c9-m4', name: 'Chapter 4 - Linear Equations in Two Variables', description: 'Linear equations, solution sets & graphical representations' },
      { id: 'c9-m5', name: 'Chapter 5 - Introduction to Euclid\'s Geometry', description: 'Axioms, postulates & Euclid\'s fifth postulate geometry' },
      { id: 'c9-m6', name: 'Chapter 6 - Lines and Angles', description: 'Intersecting lines, pairs of angles, parallel lines & transversals' },
      { id: 'c9-m7', name: 'Chapter 7 - Triangles', description: 'Congruence criteria (SAS, ASA, SSS, RHS) & triangle inequalities' },
      { id: 'c9-m8', name: 'Chapter 8 - Quadrilaterals', description: 'Properties of parallelograms, angle sum property & mid-point theorem' },
      { id: 'c9-m9', name: 'Chapter 9 - Circles', description: 'Chords, perpendiculars from center, cyclic quadrilaterals & angles' },
      { id: 'c9-m10', name: 'Chapter 10 - Heron\'s Formula', description: 'Triangle areas using semi-perimeter formula and real-world applications' },
      { id: 'c9-m11', name: 'Chapter 11 - Surface Areas and Volumes', description: 'Surface areas and volumes of right circular cones, spheres & hemispheres' },
      { id: 'c9-m12', name: 'Chapter 12 - Statistics', description: 'Data presentation, frequency distributions, histograms & polygons' },
    ],
    Science: [
      { id: 'c9-s1', name: 'Chapter 1 - Matter in Our Surroundings', description: 'Physical nature of matter, states of matter, latent heat & evaporation' },
      { id: 'c9-s2', name: 'Chapter 2 - Is Matter Around Us Pure', description: 'Mixtures, solutions, colloids, suspensions & separation techniques' },
      { id: 'c9-s3', name: 'Chapter 3 - Atoms and Molecules', description: 'Laws of chemical combination, mole concept, molecular mass & formulae' },
      { id: 'c9-s4', name: 'Chapter 4 - Structure of the Atom', description: 'Thomson, Rutherford & Bohr models, valency, atomic numbers & isotopes' },
      { id: 'c9-s5', name: 'Chapter 5 - The Fundamental Unit of Life', description: 'Cell structure, plasma membrane, nucleus, organelles & mitochondria' },
      { id: 'c9-s6', name: 'Chapter 6 - Tissues', description: 'Plant meristematic/permanent tissues & animal epithelial/connective tissues' },
      { id: 'c9-s7', name: 'Chapter 7 - Motion', description: 'Distance, displacement, velocity, acceleration & equations of motion' },
      { id: 'c9-s8', name: 'Chapter 8 - Force and Laws of Motion', description: 'Newton\'s three laws of motion, inertia, momentum & conservation' },
      { id: 'c9-s9', name: 'Chapter 9 - Gravitation', description: 'Universal law of gravitation, free fall, acceleration due to gravity & pressure' },
      { id: 'c9-s10', name: 'Chapter 10 - Work and Energy', description: 'Scientific work, kinetic & potential energy, conservation of energy, power' },
      { id: 'c9-s11', name: 'Chapter 11 - Sound', description: 'Production and propagation of sound waves, reflection, echo & human ear' },
      { id: 'c9-s12', name: 'Chapter 12 - Improvement in Food Resources', description: 'Crop yield improvement, manures, fertilisers, irrigation & animal husbandry' },
    ],
    English: [
      { id: 'c9-e1', name: 'Chapter 1 - The Fun They Had', description: 'Futuristic story by Isaac Asimov examining mechanical teachers & schools' },
      { id: 'c9-e2', name: 'Chapter 2 - The Sound of Music', description: 'Evelyn Glennie\'s perseverance & Ustad Bismillah Khan\'s mastery of shehnai' },
      { id: 'c9-e3', name: 'Chapter 3 - The Little Girl', description: 'Kezia\'s realization of her strict father\'s protective love' },
      { id: 'c9-e4', name: 'Chapter 4 - A Truly Beautiful Mind', description: 'Biography of Albert Einstein as a genius scientist and world peace champion' },
      { id: 'c9-e5', name: 'Chapter 5 - The Snake and the Mirror', description: 'Humorous encounter between a homeopathy doctor and an inquisitive snake' },
      { id: 'c9-e6', name: 'Chapter 6 - My Childhood', description: 'Dr. APJ Abdul Kalam\'s inspiring upbringing in Rameswaram' },
      { id: 'c9-e7', name: 'Chapter 7 - Reach for the Top', description: 'Courageous journeys of mountaineer Santosh Yadav & tennis star Maria Sharapova' },
      { id: 'c9-e8', name: 'Chapter 8 - Kathmandu', description: 'Travelogue exploring the vibrancy of Pashupatinath and Baudhnath stupa' },
      { id: 'c9-e9', name: 'Chapter 9 - If I Were You', description: 'Witty one-act play of playwright Gerrard outsmarting a desperate intruder' },
    ],
  },
  'Class 10': {
    Mathematics: [
      {
        id: 'c10-m1',
        name: 'Chapter 1 - Real Numbers',
        badge: 'From Provided Notes',
        description: "Euclid's Division Lemma, HCF/LCM, Prime Factorisation, Irrationality Proofs, Decimal Expansions",
      },
      {
        id: 'c10-m2',
        name: 'Chapter 2 - Polynomials',
        badge: 'From Provided Notes',
        description: 'Degree, Geometrical Zeroes, Sum & Product of Zeroes, Division Algorithm, Middle-Term Splitting',
      },
      { id: 'c10-m3', name: 'Chapter 3 - Pair of Linear Equations in Two Variables', description: 'Graphical method, substitution, elimination, cross-multiplication & consistency' },
      { id: 'c10-m4', name: 'Chapter 4 - Quadratic Equations', description: 'Standard form ax²+bx+c=0, factorisation, quadratic formula & discriminant roots' },
      { id: 'c10-m5', name: 'Chapter 5 - Arithmetic Progressions', description: 'nth term formula, sum of first n terms (Sn) & word problem modeling' },
      { id: 'c10-m6', name: 'Chapter 6 - Triangles', description: 'Similarity criteria, Basic Proportionality Theorem (Thales) & Pythagoras proofs' },
      { id: 'c10-m7', name: 'Chapter 7 - Coordinate Geometry', description: 'Distance formula, section formula, mid-point theorem & triangle area calculation' },
      { id: 'c10-m8', name: 'Chapter 8 - Introduction to Trigonometry', description: 'Trigonometric ratios (sin, cos, tan), special angle values & standard identities' },
      { id: 'c10-m9', name: 'Chapter 9 - Some Applications of Trigonometry', description: 'Heights and distances, angles of elevation and depression with multi-step angles' },
      { id: 'c10-m10', name: 'Chapter 10 - Circles', description: 'Tangents to circle, length of tangents from external point & circle theorems' },
      { id: 'c10-m11', name: 'Chapter 11 - Areas Related to Circles', description: 'Sector & segment areas, arc lengths & composite geometric plane figures' },
      { id: 'c10-m12', name: 'Chapter 12 - Surface Areas and Volumes', description: 'Combinations of solids (cylinders, cones, spheres) & volume conversions' },
      { id: 'c10-m13', name: 'Chapter 13 - Statistics', description: 'Mean (direct, assumed, step-deviation), median, mode & cumulative ogives' },
      { id: 'c10-m14', name: 'Chapter 14 - Probability', description: 'Classical probability P(E), coin/dice/card experiments & complementary events' },
    ],
    Science: [
      { id: 'c10-s1', name: 'Chapter 1 - Chemical Reactions and Equations', description: 'Balancing equations, combination, decomposition, displacement, redox & corrosion' },
      { id: 'c10-s2', name: 'Chapter 2 - Acids, Bases and Salts', description: 'Indicators, pH scale, chemical properties, bleaching powder, baking soda & POP' },
      { id: 'c10-s3', name: 'Chapter 3 - Metals and Non-Metals', description: 'Reactivity series, ionic bond formation, metallurgy roasting/calcination & alloys' },
      { id: 'c10-s4', name: 'Chapter 4 - Carbon and its Compounds', description: 'Covalent bonding, catenation, homologous series, IUPAC naming, soaps & detergents' },
      { id: 'c10-s5', name: 'Chapter 5 - Life Processes', description: 'Autotrophic/heterotrophic nutrition, respiration, human circulatory system & nephrons' },
      { id: 'c10-s6', name: 'Chapter 6 - Control and Coordination', description: 'Nervous system, reflex arc, human brain structure, phytohormones & endocrine glands' },
      { id: 'c10-s7', name: 'Chapter 7 - How do Organisms Reproduce?', description: 'Asexual reproduction, flower pollination, human reproductive organs & contraception' },
      { id: 'c10-s8', name: 'Chapter 8 - Heredity and Evolution', description: 'Mendelian monohybrid/dihybrid crosses, laws of inheritance & sex determination' },
      { id: 'c10-s9', name: 'Chapter 9 - Light: Reflection and Refraction', description: 'Mirror formula, lenses, Snell\'s law, refractive index, ray diagrams & power of lens' },
      { id: 'c10-s10', name: 'Chapter 10 - The Human Eye and Colourful World', description: 'Defects of vision (myopia, hypermetropia), prism dispersion & atmospheric refraction' },
      { id: 'c10-s11', name: 'Chapter 11 - Electricity', description: 'Ohm\'s law, factors affecting resistance, series/parallel combinations & Joule\'s heat' },
      { id: 'c10-s12', name: 'Chapter 12 - Magnetic Effects of Electric Current', description: 'Magnetic field lines, solenoid, Fleming\'s left hand rule, motors & induction' },
      { id: 'c10-s13', name: 'Chapter 13 - Our Environment', description: 'Ecosystem trophic levels, 10% energy law, ozone layer depletion & waste management' },
    ],
    English: [
      { id: 'c10-e1', name: 'Chapter 1 - A Letter to God', description: 'Lencho\'s unshakeable faith in God tested by a violent hailstorm & postal workers' },
      { id: 'c10-e2', name: 'Chapter 2 - Nelson Mandela: Long Walk to Freedom', description: 'Historical inaugural address on freedom, overcoming apartheid & human resilience' },
      { id: 'c10-e3', name: 'Chapter 3 - Two Stories About Flying', description: 'His First Flight & The Black Aeroplane exploring fear, courage and mystery' },
      { id: 'c10-e4', name: 'Chapter 4 - From the Diary of Anne Frank', description: 'Intimate WWII diary entries of young Anne Frank in hiding with family' },
      { id: 'c10-e5', name: 'Chapter 5 - Glimpses of India', description: 'Cultural vignettes: Traditional Goa bakers, Coorg warriors & Assam tea plantations' },
      { id: 'c10-e6', name: 'Chapter 6 - Mijbil the Otter', description: 'Gavin Maxwell\'s delightful chronicle of adopting and traveling with an otter' },
      { id: 'c10-e7', name: 'Chapter 7 - Madam Rides the Bus', description: 'Young Valli\'s determined solo bus adventure and brush with mortality' },
      { id: 'c10-e8', name: 'Chapter 8 - The Sermon at Benares', description: 'Gautama Buddha\'s profound lesson to Kisa Gotami on accepting the inevitability of death' },
      { id: 'c10-e9', name: 'Chapter 9 - The Proposal', description: 'Anton Chekhov\'s farcical comedy of pride and marriage negotiations in Russia' },
    ],
  },
  'Class 11': {
    Mathematics: [
      { id: 'c11-m1', name: 'Chapter 1 - Sets', description: 'Empty/finite sets, subsets, power sets, Venn diagrams, union & intersection' },
      { id: 'c11-m2', name: 'Chapter 2 - Relations and Functions', description: 'Cartesian products, domain/range, relation types, real functions & graphs' },
      { id: 'c11-m3', name: 'Chapter 3 - Trigonometric Functions', description: 'Radian measures, signs of functions, sum/difference identities & equations' },
      { id: 'c11-m4', name: 'Chapter 4 - Complex Numbers and Quadratic Equations', description: 'Imaginary unit i, modulus, conjugate, polar form & complex roots of quadratics' },
      { id: 'c11-m5', name: 'Chapter 5 - Linear Inequalities', description: 'Algebraic & graphical solutions of linear inequalities in one and two variables' },
      { id: 'c11-m6', name: 'Chapter 6 - Permutations and Combinations', description: 'Counting principles, factorials, permutations nPr & combinations nCr' },
      { id: 'c11-m7', name: 'Chapter 7 - Binomial Theorem', description: 'Binomial expansion proofs, general terms, middle terms & coefficient properties' },
      { id: 'c11-m8', name: 'Chapter 8 - Sequences and Series', description: 'Arithmetic & geometric progressions, nth terms, sum formulas, AM-GM relation' },
      { id: 'c11-m9', name: 'Chapter 9 - Straight Lines', description: 'Slope of lines, various line forms (intercept, normal) & point-to-line distance' },
      { id: 'c11-m10', name: 'Chapter 10 - Conic Sections', description: 'Standard equations of circles, parabolas, ellipses, hyperbolas & eccentricities' },
      { id: 'c11-m11', name: 'Chapter 11 - Introduction to Three Dimensional Geometry', description: '3D coordinate planes, distance formula in space & section formula' },
      { id: 'c11-m12', name: 'Chapter 12 - Limits and Derivatives', description: 'Intuitive limits, standard limits evaluation, derivative definition & power rule' },
      { id: 'c11-m13', name: 'Chapter 13 - Statistics', description: 'Measures of dispersion, mean deviation, variance & standard deviation' },
      { id: 'c11-m14', name: 'Chapter 14 - Probability', description: 'Sample spaces, events, mutually exclusive/exhaustive events & axiomatic probability' },
    ],
    Physics: [
      { id: 'c11-p1', name: 'Chapter 1 - Units and Measurements', description: 'SI base units, dimensional analysis, significant figures & error propagation' },
      { id: 'c11-p2', name: 'Chapter 2 - Motion in a Straight Line', description: 'Position-time graphs, instantaneous velocity, acceleration & calculus kinematics' },
      { id: 'c11-p3', name: 'Chapter 3 - Motion in a Plane', description: 'Vectors addition/resolution, dot/cross products, projectile motion & centripetal acceleration' },
      { id: 'c11-p4', name: 'Chapter 4 - Laws of Motion', description: 'Newton\'s laws, momentum conservation, friction mechanics & circular banking' },
      { id: 'c11-p5', name: 'Chapter 5 - Work, Energy and Power', description: 'Work-energy theorem, potential energy curves, conservative forces & collisions' },
      { id: 'c11-p6', name: 'Chapter 6 - System of Particles and Rotational Motion', description: 'Center of mass, torque, angular momentum, rotational inertia & rolling motion' },
      { id: 'c11-p7', name: 'Chapter 7 - Gravitation', description: 'Kepler\'s planetary laws, universal gravity, gravitational potential & orbital speed' },
      { id: 'c11-p8', name: 'Chapter 8 - Mechanical Properties of Solids', description: 'Stress-strain curve, Hooke\'s law, Young\'s, shear & bulk moduli of elasticity' },
      { id: 'c11-p9', name: 'Chapter 9 - Mechanical Properties of Fluids', description: 'Pascal\'s law, Archimedes\' principle, viscosity, Stokes\' law & Bernoulli\'s theorem' },
      { id: 'c11-p10', name: 'Chapter 10 - Thermal Properties of Matter', description: 'Thermal expansion, calorimetry, latent heat, conduction, convection & radiation' },
      { id: 'c11-p11', name: 'Chapter 11 - Thermodynamics', description: 'Zeroth, first & second laws of thermodynamics, PV diagrams & Carnot cycle efficiency' },
      { id: 'c11-p12', name: 'Chapter 12 - Kinetic Theory of Gases', description: 'Ideal gas pressure derivation, degrees of freedom, equipartition of energy & RMS speed' },
      { id: 'c11-p13', name: 'Chapter 13 - Oscillations', description: 'Simple harmonic motion (SHM), phase, pendulum energy, damped/forced vibrations' },
      { id: 'c11-p14', name: 'Chapter 14 - Waves', description: 'Longitudinal & transverse waves, wave velocity, superposition, standing waves & beats' },
    ],
    Chemistry: [
      { id: 'c11-c1', name: 'Chapter 1 - Some Basic Concepts of Chemistry', description: 'Mole concept, molar mass, empirical/molecular formula & stoichiometric limiting reagents' },
      { id: 'c11-c2', name: 'Chapter 2 - Structure of Atom', description: 'Bohr model, de Broglie relation, Heisenberg uncertainty, quantum numbers & orbital shapes' },
      { id: 'c11-c3', name: 'Chapter 3 - Classification of Elements & Periodicity', description: 'Modern periodic table, trends in atomic radii, ionization enthalpy & electronegativity' },
      { id: 'c11-c4', name: 'Chapter 4 - Chemical Bonding and Molecular Structure', description: 'Lewis structures, VSEPR geometries, hybridization (sp, sp², sp³) & molecular orbitals' },
      { id: 'c11-c5', name: 'Chapter 5 - Chemical Thermodynamics', description: 'Internal energy, enthalpy changes, Hess\'s law, entropy, Gibbs energy & spontaneity' },
      { id: 'c11-c6', name: 'Chapter 6 - Equilibrium', description: 'Dynamic chemical equilibrium, Le Chatelier\'s principle, ionic pH, buffers & solubility Ksp' },
      { id: 'c11-c7', name: 'Chapter 7 - Redox Reactions', description: 'Oxidation numbers, redox types & balancing equations with ion-electron method' },
      { id: 'c11-c8', name: 'Chapter 8 - Organic Chemistry: Basic Principles', description: 'IUPAC nomenclature, inductive/resonance effects, carbocations & reaction mechanisms' },
      { id: 'c11-c9', name: 'Chapter 9 - Hydrocarbons', description: 'Alkanes, alkenes, alkynes electrophilic additions, aromaticity & benzene substitution' },
    ],
    Biology: [
      { id: 'c11-b1', name: 'Chapter 1 - The Living World', description: 'Living characteristics, taxonomical hierarchy, species concept & binomial nomenclature' },
      { id: 'c11-b2', name: 'Chapter 2 - Biological Classification', description: 'Five kingdoms (Monera, Protista, Fungi, Plantae, Animalia), viruses & lichens' },
      { id: 'c11-b3', name: 'Chapter 3 - Plant Kingdom', description: 'Algae, bryophytes, pteridophytes, gymnosperms & angiosperm life cycles' },
      { id: 'c11-b4', name: 'Chapter 4 - Animal Kingdom', description: 'Non-chordate phyla (Porifera to Echinodermata) & chordata class distinctions' },
      { id: 'c11-b5', name: 'Chapter 5 - Morphology of Flowering Plants', description: 'Roots, stems, leaves, inflorescences, flowers, fruits & floral diagrams' },
      { id: 'c11-b6', name: 'Chapter 6 - Anatomy of Flowering Plants', description: 'Meristematic/permanent tissues, vascular cambium & internal organ structures' },
      { id: 'c11-b7', name: 'Chapter 7 - Structural Organisation in Animals', description: 'Epithelial, connective, muscular & nervous tissues; morphology and anatomy of frog' },
      { id: 'c11-b8', name: 'Chapter 8 - Cell: The Unit of Life', description: 'Prokaryotic/eukaryotic cells, endomembrane system, mitochondria, chloroplasts & nucleus' },
      { id: 'c11-b9', name: 'Chapter 9 - Biomolecules', description: 'Amino acids, carbohydrates, lipids, nucleic acids, enzyme kinetics & activation energy' },
      { id: 'c11-b10', name: 'Chapter 10 - Cell Cycle and Cell Division', description: 'Interphase, mitosis stages, meiosis I & II, synapsis & genetic variation' },
      { id: 'c11-b11', name: 'Chapter 11 - Photosynthesis in Higher Plants', description: 'Light harvesting complexes, photophosphorylation, Calvin C3 cycle & C4 pathway' },
      { id: 'c11-b12', name: 'Chapter 12 - Respiration in Plants', description: 'Glycolysis, citric acid Krebs cycle, ETS electron transport & ATP synthesis' },
      { id: 'c11-b13', name: 'Chapter 13 - Plant Growth and Development', description: 'Growth regulators (Auxins, Gibberellins, Cytokinins, ABA), seed dormancy' },
      { id: 'c11-b14', name: 'Chapter 14 - Breathing and Exchange of Gases', description: 'Alveolar gas exchange, oxygen dissociation curves & respiratory capacities' },
      { id: 'c11-b15', name: 'Chapter 15 - Body Fluids and Circulation', description: 'Blood groups, cardiac cycle, ECG electrical tracings & systemic/pulmonary circulation' },
      { id: 'c11-b16', name: 'Chapter 16 - Excretory Products and Elimination', description: 'Nephron filtration, counter-current multiplier system & kidney regulation' },
      { id: 'c11-b17', name: 'Chapter 17 - Locomotion and Movement', description: 'Sliding filament muscle theory, skeletal framework & synovial joint types' },
      { id: 'c11-b18', name: 'Chapter 18 - Neural Control and Coordination', description: 'Nerve impulse propagation, synaptic transmission, CNS brain structure & reflex arcs' },
      { id: 'c11-b19', name: 'Chapter 19 - Chemical Coordination and Integration', description: 'Pituitary, thyroid, adrenal, pancreatic hormones & hormone action mechanisms' },
    ],
    English: [
      { id: 'c11-e1', name: 'Chapter 1 - The Portrait of a Lady', description: 'Khushwant Singh\'s moving portrayal of his grandmother\'s dignified life and death' },
      { id: 'c11-e2', name: 'Chapter 2 - We\'re Not Afraid to Die...', description: 'Nerve-wracking maritime battle against giant waves in the Southern Ocean' },
      { id: 'c11-e3', name: 'Chapter 3 - Discovering Tut: The Saga Continues', description: 'Cutting-edge CT scanning and archaeology uncovering secrets of Pharaoh Tut' },
      { id: 'c11-e4', name: 'Chapter 4 - The Voice of the Rain', description: 'Walt Whitman\'s lyrical tribute to rain as nature\'s cyclic rejuvenating song' },
      { id: 'c11-e5', name: 'Chapter 5 - The Ailing Planet', description: 'Nani Palkhivala on global environmental degradation and sustainable stewardship' },
      { id: 'c11-e6', name: 'Chapter 6 - The Browning Version', description: 'Play depicting classical master Andrew Crocker-Harris and emotional undercurrents' },
      { id: 'c11-e7', name: 'Chapter 7 - Silk Road', description: 'Trekking through high-altitude Tibetan terrain on the pilgrimage route to Mount Kailash' },
    ],
  },
  'Class 12': {
    Mathematics: [
      { id: 'c12-m1', name: 'Chapter 1 - Relations and Functions', description: 'Equivalence relations, injective/surjective functions, composite & invertible mappings' },
      { id: 'c12-m2', name: 'Chapter 2 - Inverse Trigonometric Functions', description: 'Principal value branches, domains, ranges & inverse trigonometric formulas' },
      { id: 'c12-m3', name: 'Chapter 3 - Matrices', description: 'Matrix operations, transpose, symmetric/skew-symmetric matrices & inverse via operations' },
      { id: 'c12-m4', name: 'Chapter 4 - Determinants', description: 'Properties, minors, cofactors, adjoints, matrix inversion & Cramer linear systems' },
      { id: 'c12-m5', name: 'Chapter 5 - Continuity and Differentiability', description: 'Chain rule, parametric equations, implicit derivatives, logarithmic differentiation' },
      { id: 'c12-m6', name: 'Chapter 6 - Applications of Derivatives', description: 'Rate of change, increasing/decreasing intervals, tangents/normals & maxima/minima' },
      { id: 'c12-m7', name: 'Chapter 7 - Integrals', description: 'Indefinite integrals, substitution, partial fractions, parts & definite integral theorems' },
      { id: 'c12-m8', name: 'Chapter 8 - Applications of Integrals', description: 'Area enclosed by curves, circles, parabolas, ellipses and bounding lines' },
      { id: 'c12-m9', name: 'Chapter 9 - Differential Equations', description: 'Order/degree, variable separable method, homogeneous & linear first order equations' },
      { id: 'c12-m10', name: 'Chapter 10 - Vector Algebra', description: 'Dot product, cross product, direction cosines, unit vectors & projections' },
      { id: 'c12-m11', name: 'Chapter 11 - Three Dimensional Geometry', description: 'Vector & cartesian equations of lines and planes, angle between lines & shortest distance' },
      { id: 'c12-m12', name: 'Chapter 12 - Linear Programming', description: 'LPP formulation, feasible regions, corner point optimization & constraints' },
      { id: 'c12-m13', name: 'Chapter 13 - Probability', description: 'Conditional probability, Bayes\' theorem, independent events & random variables' },
    ],
    Physics: [
      { id: 'c12-p1', name: 'Chapter 1 - Electric Charges and Fields', description: 'Coulomb\'s law, electric field lines, electric flux, dipole torque & Gauss\'s law applications' },
      { id: 'c12-p2', name: 'Chapter 2 - Electrostatic Potential and Capacitance', description: 'Equipotential surfaces, dipole potential, parallel plate capacitors & dielectrics' },
      { id: 'c12-p3', name: 'Chapter 3 - Current Electricity', description: 'Drift velocity, Ohm\'s law, resistivity, Kirchhoff\'s rules & Wheatstone bridge circuits' },
      { id: 'c12-p4', name: 'Chapter 4 - Moving Charges and Magnetism', description: 'Biot-Savart law, Ampere\'s circuital law, solenoid fields, Lorentz force & galvanometers' },
      { id: 'c12-p5', name: 'Chapter 5 - Magnetism and Matter', description: 'Earth magnetism, magnetic dipoles, dia/para/ferromagnetic materials & hysteresis' },
      { id: 'c12-p6', name: 'Chapter 6 - Electromagnetic Induction', description: 'Faraday\'s laws, Lenz\'s law, motional EMF, eddy currents & self/mutual inductance' },
      { id: 'c12-p7', name: 'Chapter 7 - Alternating Current', description: 'AC circuits with R, L, C, series LCR resonance, power factor & step-up/down transformers' },
      { id: 'c12-p8', name: 'Chapter 8 - Electromagnetic Waves', description: 'Maxwell\'s displacement current, transverse nature of EM waves & EM spectrum uses' },
      { id: 'c12-p9', name: 'Chapter 9 - Ray Optics and Optical Instruments', description: 'Spherical mirrors, refraction, lens maker\'s equation, prisms, microscopes & telescopes' },
      { id: 'c12-p10', name: 'Chapter 10 - Wave Optics', description: 'Huygens\' wave principle, Young\'s double slit interference & single slit diffraction' },
      { id: 'c12-p11', name: 'Chapter 11 - Dual Nature of Radiation and Matter', description: 'Photoelectric effect, Einstein\'s equation, de Broglie matter waves & threshold frequency' },
      { id: 'c12-p12', name: 'Chapter 12 - Atoms', description: 'Rutherford alpha scattering, Bohr postulates, hydrogen spectral series & energy levels' },
      { id: 'c12-p13', name: 'Chapter 13 - Nuclei', description: 'Nuclear radius, mass defect, binding energy curve, radioactivity, fission & fusion' },
      { id: 'c12-p14', name: 'Chapter 14 - Semiconductor Electronics', description: 'Energy bands, intrinsic/extrinsic semiconductors, p-n diodes, rectifiers & logic gates' },
    ],
    Chemistry: [
      { id: 'c12-c1', name: 'Chapter 1 - Solutions', description: 'Raoult\'s law, colligative properties, boiling elevation, osmotic pressure & van\'t Hoff factor' },
      { id: 'c12-c2', name: 'Chapter 2 - Electrochemistry', description: 'Galvanic cells, Nernst equation, Kohlrausch\'s law, fuel cells & corrosion prevention' },
      { id: 'c12-c3', name: 'Chapter 3 - Chemical Kinetics', description: 'Reaction rates, rate laws, order/molecularity, integrated equations & Arrhenius activation' },
      { id: 'c12-c4', name: 'Chapter 4 - The d- and f- Block Elements', description: 'Transition metal properties, oxidation states, lanthanoid contraction & colored ions' },
      { id: 'c12-c5', name: 'Chapter 5 - Coordination Compounds', description: 'Werner theory, IUPAC naming, ligand isomerism, CFT crystal field splitting & stability' },
      { id: 'c12-c6', name: 'Chapter 6 - Haloalkanes and Haloarenes', description: 'SN1/SN2 substitution mechanisms, optical inversion, elimination & organometallics' },
      { id: 'c12-c7', name: 'Chapter 7 - Alcohols, Phenols and Ethers', description: 'Hydroboration, acidic nature of phenols, Kolbe/Reimer-Tiemann & Williamson synthesis' },
      { id: 'c12-c8', name: 'Chapter 8 - Aldehydes, Ketones and Carboxylic Acids', description: 'Nucleophilic additions, Aldol condensation, Cannizzaro & acidity of carboxylic acids' },
      { id: 'c12-c9', name: 'Chapter 9 - Amines', description: 'Basicity order, Gabriel phthalimide synthesis, Hinsberg reagent & diazonium coupling' },
      { id: 'c12-c10', name: 'Chapter 10 - Biomolecules', description: 'Glucose/fructose structures, peptide bonds, protein secondary/tertiary structures & DNA/RNA' },
    ],
    Biology: [
      { id: 'c12-b1', name: 'Chapter 1 - Sexual Reproduction in Flowering Plants', description: 'Pollen grain, embryo sac, double fertilization, endosperm formation & apomixis' },
      { id: 'c12-b2', name: 'Chapter 2 - Human Reproduction', description: 'Spermatogenesis, oogenesis, ovarian cycle, fertilization & blastocyst implantation' },
      { id: 'c12-b3', name: 'Chapter 3 - Reproductive Health', description: 'Contraceptive measures, MTP regulations, STDs & IVF/ART infertility techniques' },
      { id: 'c12-b4', name: 'Chapter 4 - Principles of Inheritance and Variation', description: 'Mendelian genetics, linkage & crossing over, sex linkage & chromosomal disorders' },
      { id: 'c12-b5', name: 'Chapter 5 - Molecular Basis of Inheritance', description: 'DNA replication, transcription, genetic code, translation & Lac operon regulation' },
      { id: 'c12-b6', name: 'Chapter 6 - Evolution', description: 'Origin of life, Darwinian selection, Hardy-Weinberg equilibrium & hominid evolution' },
      { id: 'c12-b7', name: 'Chapter 7 - Human Health and Disease', description: 'Pathogens, malaria cycle, innate/acquired immunity, cancer oncogenes & AIDS/HIV' },
      { id: 'c12-b8', name: 'Chapter 8 - Microbes in Human Welfare', description: 'Microbial sewage treatment, biogas production, biocontrol agents & biofertilizers' },
      { id: 'c12-b9', name: 'Chapter 9 - Biotechnology: Principles and Processes', description: 'Restriction endonucleases, plasmid vectors, PCR amplification & gel electrophoresis' },
      { id: 'c12-b10', name: 'Chapter 10 - Biotechnology and its Applications', description: 'Bt crops, RNA interference, recombinant human insulin & gene therapy trials' },
      { id: 'c12-b11', name: 'Chapter 11 - Organisms and Populations', description: 'Ecological adaptations, population growth models (logistic/exponential) & symbiosis' },
      { id: 'c12-b12', name: 'Chapter 12 - Ecosystem', description: 'Energy flow, food webs, ecological pyramids of energy & primary/secondary succession' },
      { id: 'c12-b13', name: 'Chapter 13 - Biodiversity and Conservation', description: 'Species richness patterns, Evil Quartet extinction causes, hot spots & protected areas' },
    ],
    English: [
      { id: 'c12-e1', name: 'Chapter 1 - The Last Lesson', description: 'Franz and M. Hamel\'s emotional tribute to the French language under Prussian occupation' },
      { id: 'c12-e2', name: 'Chapter 2 - Lost Spring', description: 'Stories of dispossessed children: Saheb the ragpicker & Mukesh the bangle maker' },
      { id: 'c12-e3', name: 'Chapter 3 - Deep Water', description: 'William Douglas recounts conquering a debilitating childhood fear of water' },
      { id: 'c12-e4', name: 'Chapter 4 - The Rattrap', description: 'Philosophical tale of a cynical peddler redeemed by compassion and hospitality' },
      { id: 'c12-e5', name: 'Chapter 5 - Indigo', description: 'Mahatma Gandhi\'s decisive Champaran satyagraha on behalf of peasant sharecroppers' },
      { id: 'c12-e6', name: 'Chapter 6 - Poets and Pancakes', description: 'Witty account of Gemini Studios, cinematic makeup, national integration and Stephen Spender' },
      { id: 'c12-e7', name: 'Chapter 7 - The Interview', description: 'Exploration of celebrity journalism and interview mechanics with novelist Umberto Eco' },
      { id: 'c12-e8', name: 'Chapter 8 - Going Places', description: 'Teenage dreams, class realities & hero-worship of football hero Danny Casey' },
    ],
  },
};

const DAY_PRESETS = [3, 5, 7, 10, 14, 21, 30];

const STUDY_TIME_OPTIONS = [
  { label: '1 hour / day', minutes: 60, subtext: 'Light daily pace' },
  { label: '1.5 hours / day', minutes: 90, subtext: 'Balanced focus' },
  { label: '2 hours / day', minutes: 120, subtext: 'Recommended for mastery' },
  { label: '3 hours / day', minutes: 180, subtext: 'Intensive revision' },
  { label: '4 hours / day', minutes: 240, subtext: 'Full sprint' },
];

export default function CreatePlanModal({ isOpen, onClose, onPlanCreated }) {
  // Step 1 = Class, Subject, Chapter, Days
  // Step 2 = Daily Study Time & Execute
  const [step, setStep] = useState(1);

  // Form selections
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedChapter, setSelectedChapter] = useState('Chapter 1 - Real Numbers');
  const [days, setDays] = useState(5);
  const [customDays, setCustomDays] = useState('');
  const [selectedTimeOption, setSelectedTimeOption] = useState(STUDY_TIME_OPTIONS[2]); // 2 hours/day default

  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  // Available subjects for selected class
  const availableSubjects = SUBJECTS[selectedClass] || ['Mathematics'];
  // Available chapters for selected class and subject
  const availableChapters =
    CHAPTERS[selectedClass]?.[selectedSubject] ||
    CHAPTERS['Class 10']?.['Mathematics'] ||
    [];

  const handleClassChange = (e) => {
    const cls = e.target.value;
    setSelectedClass(cls);
    const subs = SUBJECTS[cls] || ['Mathematics'];
    const nextSub = subs.includes(selectedSubject) ? selectedSubject : subs[0];
    setSelectedSubject(nextSub);
    const chaps = CHAPTERS[cls]?.[nextSub] || CHAPTERS['Class 10']?.['Mathematics'] || [];
    setSelectedChapter(chaps[0]?.name || '');
  };

  const handleSubjectChange = (e) => {
    const sub = e.target.value;
    setSelectedSubject(sub);
    const chaps = CHAPTERS[selectedClass]?.[sub] || CHAPTERS['Class 10']?.['Mathematics'] || [];
    setSelectedChapter(chaps[0]?.name || '');
  };

  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    const effectiveDays = customDays ? parseInt(customDays, 10) : days;
    if (!effectiveDays || effectiveDays < 1 || effectiveDays > 60) {
      setError('Please choose a valid number of days between 1 and 60.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleExecute = async () => {
    const effectiveDays = customDays ? parseInt(customDays, 10) : days;
    try {
      setIsExecuting(true);
      setError(null);

      const plan = await studyPlanService.generateStudyPlan({
        classLevel: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
        days: effectiveDays,
        studyTime: selectedTimeOption.label,
        dailyMinutes: selectedTimeOption.minutes,
      });

      if (onPlanCreated) {
        onPlanCreated(plan);
      }
      onClose();
      // Reset step for next open
      setStep(1);
    } catch (err) {
      console.error('Study plan execution failed', err);
      setError(err.message || 'Failed to generate study plan with Grok. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  const effectiveDaysCount = customDays ? parseInt(customDays, 10) : days;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isExecuting ? () => {} : onClose}
      title={step === 1 ? 'Step 1: Select Syllabus & Days' : 'Step 2: Daily Study Time & Execute'}
      size="md"
    >
      <div style={{ padding: '4px 0' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: 'var(--primary)',
            }}
          />
          <div
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: step === 2 ? 'var(--primary)' : 'var(--border-subtle)',
              transition: 'background 0.3s ease',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        {/* STEP 1: CLASS, SUBJECT, CHAPTER, DAYS */}
        {step === 1 && (
          <form onSubmit={handleProceedToStep2} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Select Class */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                <GraduationCap size={16} color="var(--primary)" />
                1. Select Class
              </label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                }}
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Subject */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                <BookOpen size={16} color="var(--primary)" />
                2. Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={handleSubjectChange}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                }}
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Select Lesson / Chapter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  <FileText size={16} color="var(--primary)" />
                  3. Select Lesson / Chapter
                </label>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    background: 'rgba(99, 102, 241, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {availableChapters.find((c) => c.name === selectedChapter)?.badge || 'NCERT Curriculum'}
                </span>
              </div>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                }}
              >
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.name}>
                    {ch.name}
                  </option>
                ))}
              </select>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {availableChapters.find((c) => c.name === selectedChapter)?.description || 'Includes core concepts, theorems & exercises.'}
              </p>
            </div>

            {/* 4. Select Number of Days */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  <Calendar size={16} color="var(--primary)" />
                  4. Select Number of Days
                </label>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {effectiveDaysCount} Days Plan
                </span>
              </div>

              {/* Preset Days Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {DAY_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDays(d);
                      setCustomDays('');
                    }}
                    style={{
                      flex: '1 0 calc(25% - 8px)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: !customDays && days === d ? 'var(--primary)' : 'var(--bg-elevated)',
                      color: !customDays && days === d ? '#ffffff' : 'var(--text-secondary)',
                      border: !customDays && days === d ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {d} Days
                  </button>
                ))}
              </div>

              {/* Meaning explanation */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Zap size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Goal:</strong> "I want to finish this syllabus in <strong>{effectiveDaysCount} days</strong>."
                </span>
              </div>
            </div>

            {/* Step 1 Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={ArrowRight}
              fullWidth
              style={{ marginTop: '6px' }}
            >
              Continue: Set Daily Study Time
            </Button>
          </form>
        )}

        {/* STEP 2: DAILY STUDY TIME & EXECUTE */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Recap Box */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                Configured Syllabus Target
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {selectedClass} • {selectedSubject}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>
                {selectedChapter}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Target Timeline: <strong>{effectiveDaysCount} Days</strong>
              </div>
            </div>

            {/* How much time can you study per day? */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.925rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                }}
              >
                <Clock size={18} color="var(--primary)" />
                How much time can you study per day?
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {STUDY_TIME_OPTIONS.map((opt) => {
                  const isSelected = selectedTimeOption.minutes === opt.minutes;
                  return (
                    <div
                      key={opt.minutes}
                      onClick={() => setSelectedTimeOption(opt)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-elevated)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {opt.subtext}
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 size={20} color="var(--primary)" />
                      ) : (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border-medium)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Button
                type="button"
                variant="secondary"
                size="md"
                icon={ArrowLeft}
                onClick={() => setStep(1)}
                disabled={isExecuting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                icon={Sparkles}
                onClick={handleExecute}
                loading={isExecuting}
                disabled={isExecuting}
                fullWidth
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                {isExecuting ? 'Grok Synthesizing Plan...' : 'EXECUTE'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
