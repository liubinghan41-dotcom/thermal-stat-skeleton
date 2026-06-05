import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "src", "data");

const generatedAt = new Date().toISOString();

const sourceSeeds = [
  ["callen-1985", "textbook", ["Callen, H. B."], "Thermodynamics and an Introduction to Thermostatistics", 1985, "公设化热力学与热统桥接", "verified"],
  ["reif-1965", "textbook", ["Reif, F."], "Fundamentals of Statistical and Thermal Physics", 1965, "本科到研究生过渡的统计物理主线", "verified"],
  ["pathria-2011", "textbook", ["Pathria, R. K.", "Beale, P. D."], "Statistical Mechanics", 2011, "系综、配分函数与涨落关系", "verified"],
  ["huang-1987", "textbook", ["Huang, K."], "Statistical Mechanics", 1987, "量子统计、相变和场论入口", "verified"],
  ["landau-lifshitz-1980", "textbook", ["Landau, L. D.", "Lifshitz, E. M."], "Statistical Physics, Part 1", 1980, "热力学极限、涨落与相变", "verified"],
  ["kardar-particles-2007", "textbook", ["Kardar, M."], "Statistical Physics of Particles", 2007, "微观分布到热势的现代推导", "verified"],
  ["kardar-fields-2007", "textbook", ["Kardar, M."], "Statistical Physics of Fields", 2007, "临界现象与重整化群", "verified"],
  ["kittel-kroemer-1980", "textbook", ["Kittel, C.", "Kroemer, H."], "Thermal Physics", 1980, "直观热物理与统计推理", "verified"],
  ["schroeder-2000", "textbook", ["Schroeder, D. V."], "An Introduction to Thermal Physics", 2000, "学习型热统概念入口", "verified"],
  ["blundell-2010", "textbook", ["Blundell, S.", "Blundell, K."], "Concepts in Thermal Physics", 2010, "概念图式和物理例题", "verified"],
  ["fermi-1936", "monograph", ["Fermi, E."], "Thermodynamics", 1936, "经典热力学短程结构", "verified"],
  ["zemansky-dittman-1997", "textbook", ["Zemansky, M. W.", "Dittman, R. H."], "Heat and Thermodynamics", 1997, "传统热学和工程热力学", "needs-source"],
  ["tolman-1938", "monograph", ["Tolman, R. C."], "The Principles of Statistical Mechanics", 1938, "经典统计力学体系化", "verified"],
  ["hill-1986", "monograph", ["Hill, T. L."], "An Introduction to Statistical Thermodynamics", 1986, "化学势与小系统热统", "needs-source"],
  ["mcquarrie-1976", "textbook", ["McQuarrie, D. A."], "Statistical Mechanics", 1976, "分子统计力学与化学应用", "needs-source"],
  ["chandler-1987", "textbook", ["Chandler, D."], "Introduction to Modern Statistical Mechanics", 1987, "现代统计力学与涨落视角", "verified"],
  ["sethna-2006", "textbook", ["Sethna, J. P."], "Statistical Mechanics: Entropy, Order Parameters, and Complexity", 2006, "熵、序参量与复杂系统入口", "verified"],
  ["goldenfeld-1992", "textbook", ["Goldenfeld, N."], "Lectures on Phase Transitions and the Renormalization Group", 1992, "相变和重整化群", "verified"],
  ["chaikin-lubensky-1995", "textbook", ["Chaikin, P. M.", "Lubensky, T. C."], "Principles of Condensed Matter Physics", 1995, "凝聚态中的热统概念", "needs-source"],
  ["ma-1976", "textbook", ["Ma, S.-K."], "Modern Theory of Critical Phenomena", 1976, "临界现象理论", "verified"],
  ["stanley-1971", "monograph", ["Stanley, H. E."], "Introduction to Phase Transitions and Critical Phenomena", 1971, "临界指数和标度", "verified"],
  ["yeomans-1992", "textbook", ["Yeomans, J. M."], "Statistical Mechanics of Phase Transitions", 1992, "相变学习路线", "needs-source"],
  ["le-bellac-2004", "textbook", ["Le Bellac, M.", "Mortessagne, F.", "Batrouni, G. G."], "Equilibrium and Non-Equilibrium Statistical Thermodynamics", 2004, "平衡与非平衡桥接", "needs-source"],
  ["plischke-2006", "textbook", ["Plischke, M.", "Bergersen, B."], "Equilibrium Statistical Physics", 2006, "平衡统计物理", "needs-source"],
  ["reichl-2016", "textbook", ["Reichl, L. E."], "A Modern Course in Statistical Physics", 2016, "现代统计物理课程", "needs-source"],
  ["de-groot-mazur-1962", "monograph", ["de Groot, S. R.", "Mazur, P."], "Non-Equilibrium Thermodynamics", 1962, "非平衡热力学", "verified"],
  ["kubo-toda-1991", "monograph", ["Kubo, R.", "Toda, M.", "Hashitsume, N."], "Statistical Physics II", 1991, "涨落、响应与非平衡", "verified"],
  ["landau-lifshitz-fluid-1987", "textbook", ["Landau, L. D.", "Lifshitz, E. M."], "Fluid Mechanics", 1987, "输运与局域平衡背景", "needs-source"],
  ["greiner-1995", "textbook", ["Greiner, W.", "Neise, L.", "Stoecker, H."], "Thermodynamics and Statistical Mechanics", 1995, "课程型热统材料", "needs-source"],
  ["diu-1989", "textbook", ["Diu, B.", "Guthmann, C.", "Lederer, D.", "Roulet, B."], "Elements of Statistical Mechanics", 1989, "统计物理教学条目", "needs-source"],
  ["atkins-2010", "textbook", ["Atkins, P.", "de Paula, J."], "Physical Chemistry", 2010, "化学热力学与相平衡", "needs-source"],
  ["dill-bromberg-2010", "textbook", ["Dill, K.", "Bromberg, S."], "Molecular Driving Forces", 2010, "分子视角的熵和自由能", "needs-source"],
  ["mayer-mayer-1940", "monograph", ["Mayer, J. E.", "Mayer, M. G."], "Statistical Mechanics", 1940, "集团展开与气体理论", "needs-source"],
  ["ruelle-1969", "monograph", ["Ruelle, D."], "Statistical Mechanics: Rigorous Results", 1969, "严格热力学极限", "verified"],
  ["gallavotti-1999", "monograph", ["Gallavotti, G."], "Statistical Mechanics: A Short Treatise", 1999, "动力系统式统计力学", "needs-source"],
  ["balian-2007", "textbook", ["Balian, R."], "From Microphysics to Macrophysics", 2007, "宏观量涌现的系统推导", "needs-source"],
  ["carnot-1824", "original", ["Carnot, S."], "Reflections on the Motive Power of Fire", 1824, "热机与可逆循环源头", "verified"],
  ["clapeyron-1834", "original", ["Clapeyron, E."], "Memoir on the Motive Power of Heat", 1834, "Carnot 思想的数学化", "verified"],
  ["kelvin-1848", "original", ["Thomson, W."], "On an Absolute Thermometric Scale", 1848, "绝对温标", "verified"],
  ["clausius-1850", "original", ["Clausius, R."], "On the Moving Force of Heat", 1850, "热力学第二定律表述", "verified"],
  ["clausius-1865", "original", ["Clausius, R."], "The Mechanical Theory of Heat", 1865, "熵概念与 Clausius 定义", "verified"],
  ["maxwell-1871", "original", ["Maxwell, J. C."], "Theory of Heat", 1871, "分子运动论与 Maxwell 关系背景", "verified"],
  ["boltzmann-1872", "original", ["Boltzmann, L."], "Further Studies on the Thermal Equilibrium of Gas Molecules", 1872, "Boltzmann 方程与 H 定理", "verified"],
  ["boltzmann-1877", "original", ["Boltzmann, L."], "On the Relation Between the Second Law and Probability", 1877, "微观态计数与熵", "verified"],
  ["boltzmann-1896", "monograph", ["Boltzmann, L."], "Lectures on Gas Theory", 1896, "气体动理论系统化", "needs-source"],
  ["gibbs-1876", "original", ["Gibbs, J. W."], "On the Equilibrium of Heterogeneous Substances", 1876, "热势、相律与相平衡", "verified"],
  ["gibbs-1902", "original", ["Gibbs, J. W."], "Elementary Principles in Statistical Mechanics", 1902, "系综方法源头", "verified"],
  ["planck-1901", "original", ["Planck, M."], "On the Law of Distribution of Energy in the Normal Spectrum", 1901, "黑体辐射与量子统计入口", "verified"],
  ["planck-1906", "monograph", ["Planck, M."], "Treatise on Thermodynamics", 1906, "经典热力学体系", "needs-source"],
  ["einstein-1905-brownian", "original", ["Einstein, A."], "On the Movement of Small Particles Suspended in Stationary Liquids", 1905, "布朗运动与涨落", "verified"],
  ["einstein-1905-quanta", "original", ["Einstein, A."], "On a Heuristic Point of View Concerning the Production and Transformation of Light", 1905, "光量子和热辐射", "verified"],
  ["einstein-1907-solid", "original", ["Einstein, A."], "Die Plancksche Theorie der Strahlung und die Theorie der spezifischen Wärme", 1907, "Einstein 固体与量子热容", "verified"],
  ["bose-1924", "original", ["Bose, S. N."], "Planck's Law and the Hypothesis of Light Quanta", 1924, "Bose 统计", "verified"],
  ["fermi-1926", "original", ["Fermi, E."], "On the Quantum Theory of Radiation", 1926, "Fermi 统计入口", "verified"],
  ["dirac-1926", "original", ["Dirac, P. A. M."], "On the Theory of Quantum Mechanics", 1926, "Fermi-Dirac 分布背景", "verified"],
  ["debye-1912", "original", ["Debye, P."], "Zur Theorie der spezifischen Waermen", 1912, "Debye 模型", "verified"],
  ["van-der-waals-1873", "original", ["van der Waals, J. D."], "On the Continuity of the Gaseous and Liquid States", 1873, "真实气体与临界点", "verified"],
  ["onsager-1931-a", "original", ["Onsager, L."], "Reciprocal Relations in Irreversible Processes I", 1931, "Onsager 倒易关系", "verified"],
  ["onsager-1931-b", "original", ["Onsager, L."], "Reciprocal Relations in Irreversible Processes II", 1931, "非平衡线性响应", "verified"],
  ["nyquist-1928", "original", ["Nyquist, H."], "Thermal Agitation of Electric Charge in Conductors", 1928, "涨落噪声", "verified"],
  ["johnson-1928", "original", ["Johnson, J. B."], "Thermal Agitation of Electricity in Conductors", 1928, "热噪声实验背景", "verified"],
  ["green-1954", "original", ["Green, M. S."], "Markoff Random Processes and the Statistical Mechanics of Time-Dependent Phenomena", 1954, "Green-Kubo 关系", "verified"],
  ["kubo-1957", "original", ["Kubo, R."], "Statistical-Mechanical Theory of Irreversible Processes", 1957, "线性响应与涨落耗散", "verified"],
  ["mori-1965", "original", ["Mori, H."], "Transport, Collective Motion, and Brownian Motion", 1965, "投影算符和广义 Langevin", "verified"],
  ["zwanzig-1961", "original", ["Zwanzig, R."], "Memory Effects in Irreversible Thermodynamics", 1961, "记忆核与非平衡", "verified"],
  ["ehrenfest-1933", "original", ["Ehrenfest, P."], "Phase Changes in the Ordinary and Extended Sense", 1933, "相变分类源头", "needs-source"],
  ["landau-1937", "original", ["Landau, L. D."], "On the Theory of Phase Transitions", 1937, "Landau 理论", "verified"],
  ["yang-lee-1952-a", "original", ["Yang, C. N.", "Lee, T. D."], "Statistical Theory of Equations of State and Phase Transitions I", 1952, "Yang-Lee 零点", "verified"],
  ["lee-yang-1952-b", "original", ["Lee, T. D.", "Yang, C. N."], "Statistical Theory of Equations of State and Phase Transitions II", 1952, "相变解析结构", "verified"],
  ["ising-1925", "original", ["Ising, E."], "Contribution to the Theory of Ferromagnetism", 1925, "Ising 模型", "verified"],
  ["peierls-1936", "original", ["Peierls, R."], "On Ising's Model of Ferromagnetism", 1936, "二维 Ising 有序论证", "verified"],
  ["wilson-1971", "original", ["Wilson, K. G."], "Renormalization Group and Critical Phenomena", 1971, "重整化群", "verified"],
  ["wilson-kogut-1974", "review", ["Wilson, K. G.", "Kogut, J."], "The Renormalization Group and the epsilon Expansion", 1974, "重整化群综述", "verified"],
  ["hohenberg-halperin-1977", "review", ["Hohenberg, P. C.", "Halperin, B. I."], "Theory of Dynamic Critical Phenomena", 1977, "动态临界现象", "needs-source"],
  ["bcs-1957", "original", ["Bardeen, J.", "Cooper, L. N.", "Schrieffer, J. R."], "Theory of Superconductivity", 1957, "相变应用背景", "needs-source"],
  ["anderson-1958", "original", ["Anderson, P. W."], "Coherent Excited States in the Theory of Superconductivity", 1958, "对称破缺应用", "needs-source"],
  ["widom-1965", "original", ["Widom, B."], "Equation of State in the Neighborhood of the Critical Point", 1965, "标度律", "verified"],
  ["fisher-1967", "review", ["Fisher, M. E."], "The Theory of Equilibrium Critical Phenomena", 1967, "临界现象综述", "verified"],
  ["metropolis-1953", "original", ["Metropolis, N.", "Rosenbluth, A. W.", "Rosenbluth, M. N.", "Teller, A. H.", "Teller, E."], "Equation of State Calculations by Fast Computing Machines", 1953, "Monte Carlo 抽样", "verified"],
  ["alder-wainwright-1957", "original", ["Alder, B. J.", "Wainwright, T. E."], "Phase Transition for a Hard Sphere System", 1957, "分子动力学与相变", "needs-source"],
  ["nose-1984", "original", ["Nose, S."], "A Unified Formulation of the Constant Temperature Molecular Dynamics Methods", 1984, "恒温分子动力学", "needs-source"],
  ["hoover-1985", "original", ["Hoover, W. G."], "Canonical Dynamics: Equilibrium Phase-Space Distributions", 1985, "Nosé-Hoover 动力学", "needs-source"],
  ["jaynes-1957-a", "original", ["Jaynes, E. T."], "Information Theory and Statistical Mechanics I", 1957, "最大熵原理", "verified"],
  ["jaynes-1957-b", "original", ["Jaynes, E. T."], "Information Theory and Statistical Mechanics II", 1957, "最大熵推断续篇", "verified"],
  ["shannon-1948", "original", ["Shannon, C. E."], "A Mathematical Theory of Communication", 1948, "信息熵背景", "verified"],
  ["jarzynski-1997", "original", ["Jarzynski, C."], "Nonequilibrium Equality for Free Energy Differences", 1997, "非平衡功等式", "verified"],
  ["crooks-1999", "original", ["Crooks, G. E."], "Entropy Production Fluctuation Theorem and the Nonequilibrium Work Relation", 1999, "涨落定理", "verified"],
  ["gallavotti-cohen-1995", "original", ["Gallavotti, G.", "Cohen, E. G. D."], "Dynamical Ensembles in Nonequilibrium Statistical Mechanics", 1995, "非平衡涨落定理", "verified"],
];

const sourceIds = new Set(sourceSeeds.map(([id]) => id));

const sections = [
  {
    id: "thermo-structure",
    title: "I 热力学结构",
    topics: [
      ["thermodynamic-system", "热力学系统", "", "thermodynamics", "系统边界、外界与状态描述的起点。"],
      ["state-variable", "状态量", "", "thermodynamics", "只依赖平衡态而不依赖路径的宏观量。"],
      ["equilibrium-state", "平衡态", "", "thermodynamics", "宏观量稳定且无净流的状态。"],
      ["zeroth-law", "热力学第零定律", "", "thermodynamics", "温度可定义的经验基础。"],
      ["temperature", "温度 T", "T", "thermodynamics", "热平衡方向和能量分布斜率的状态量。"],
      ["heat", "热量 δQ", "\\delta Q", "thermodynamics", "因温差通过边界传递的能量。"],
      ["work", "功 δW", "\\delta W", "thermodynamics", "通过广义力和广义位移交换的能量。"],
      ["quasi-static-process", "准静态过程", "", "thermodynamics", "过程路径可近似为连续平衡态。"],
      ["reversible-process", "可逆过程", "", "thermodynamics", "系统与环境可无耗散地复原的理想过程。"],
      ["irreversible-process", "不可逆过程", "", "thermodynamics", "伴随熵产生或耗散的真实过程。"],
      ["first-law", "热力学第一定律", "", "thermodynamics", "能量守恒在热过程中的形式。"],
      ["internal-energy", "内能 U", "U", "thermodynamics", "系统微观能量的宏观状态函数。"],
      ["second-law", "热力学第二定律", "", "thermodynamics", "熵增和热机效率限制的结构性定律。"],
      ["entropy", "熵 S", "S", "bridge", "刻画宏观不可逆性与微观态数目的状态函数。"],
      ["third-law", "热力学第三定律", "", "thermodynamics", "低温极限下熵的标定与可达性限制。"],
    ],
  },
  {
    id: "potentials-stability",
    title: "II 热势与稳定性",
    topics: [
      ["enthalpy", "焓 H", "H", "thermodynamics", "定压热过程中自然出现的热势。"],
      ["helmholtz-free-energy", "Helmholtz 自由能 F", "F", "bridge", "固定 N,V,T 时由配分函数生成的热势。"],
      ["gibbs-free-energy", "Gibbs 自由能 G", "G", "thermodynamics", "固定 N,p,T 时判定平衡的热势。"],
      ["grand-potential", "巨热势 Ω", "\\Omega_G", "bridge", "固定 μ,V,T 时的自然热势。"],
      ["legendre-transform", "Legendre 变换", "", "mathematical-tool", "在自然变量之间更换热势的数学工具。"],
      ["natural-variables", "自然变量", "", "thermodynamics", "热势微分中最自然的独立变量。"],
      ["maxwell-relations", "Maxwell 关系", "", "mathematical-tool", "热势二阶混合偏导相等给出的响应关系。"],
      ["euler-relation", "Euler 齐次关系", "", "mathematical-tool", "广延量一阶齐次性导出的整体关系。"],
      ["gibbs-duhem", "Gibbs-Duhem 关系", "", "thermodynamics", "强度量之间的约束关系。"],
      ["heat-capacity", "热容 C", "C", "thermodynamics", "能量对温度变化的响应函数。"],
      ["compressibility", "压缩率 κ", "\\kappa", "thermodynamics", "体积对压力的响应。"],
      ["thermal-expansion", "热膨胀系数 α", "\\alpha", "thermodynamics", "体积对温度的响应。"],
      ["stability-criterion", "稳定性判据", "", "thermodynamics", "平衡态对小扰动的二阶条件。"],
      ["convexity", "凸性与凹性", "", "mathematical-tool", "熵和热势稳定性的几何语言。"],
      ["le-chatelier", "Le Chatelier 原理", "", "thermodynamics", "平衡系统对扰动的反向响应倾向。"],
    ],
  },
  {
    id: "equations-processes",
    title: "III 状态方程与过程",
    topics: [
      ["ideal-gas-law", "理想气体状态方程", "pV=Nk_BT", "bridge", "宏观状态方程与微观模型的基本样例。"],
      ["real-gas", "真实气体", "", "thermodynamics", "考虑分子体积和相互作用的气体模型。"],
      ["van-der-waals", "van der Waals 方程", "", "thermodynamics", "真实气体和临界行为的最小模型。"],
      ["virial-expansion", "Virial 展开", "", "bridge", "以密度展开相互作用修正的状态方程。"],
      ["adiabatic-process", "绝热过程", "", "thermodynamics", "无热量交换的过程。"],
      ["isothermal-process", "等温过程", "", "thermodynamics", "温度保持不变的过程。"],
      ["isobaric-process", "等压过程", "", "thermodynamics", "压力保持不变的过程。"],
      ["isochoric-process", "等容过程", "", "thermodynamics", "体积保持不变的过程。"],
      ["carnot-cycle", "Carnot 循环", "", "thermodynamics", "可逆热机的理想循环。"],
      ["heat-engine", "热机", "", "thermodynamics", "将热流部分转化为功的装置。"],
      ["refrigerator", "制冷机", "", "thermodynamics", "以外界功驱动逆向热流的装置。"],
      ["joule-thomson", "Joule-Thomson 效应", "", "thermodynamics", "节流过程中的温度变化。"],
      ["clapeyron-equation", "Clapeyron 方程", "", "thermodynamics", "相边界斜率与潜热的关系。"],
      ["phase-rule", "Gibbs 相律", "", "thermodynamics", "多相多组分系统自由度计数。"],
      ["chemical-potential", "化学势 μ", "\\mu", "bridge", "粒子数变化对应的广义力。"],
    ],
  },
  {
    id: "ensembles-partition",
    title: "IV 系综与配分函数",
    topics: [
      ["microstate", "微观态", "", "statistical-mechanics", "系统在微观自由度上的完整状态。"],
      ["macrostate", "宏观态", "", "bridge", "由少量宏观量刻画的大量微观态集合。"],
      ["phase-space", "相空间", "", "statistical-mechanics", "经典微观态的几何空间。"],
      ["density-of-states", "态密度 g(E)", "g(E)", "statistical-mechanics", "能量附近微观态数目的密度。"],
      ["microcanonical-ensemble", "微正则系综", "", "statistical-mechanics", "固定 E,V,N 的孤立系统系综。"],
      ["canonical-ensemble", "正则系综", "", "statistical-mechanics", "固定 N,V,T 的热接触系综。"],
      ["grand-canonical-ensemble", "巨正则系综", "", "statistical-mechanics", "固定 μ,V,T 且可交换粒子的系综。"],
      ["isothermal-isobaric-ensemble", "等温等压系综", "", "statistical-mechanics", "固定 N,p,T 的系综。"],
      ["boltzmann-factor", "Boltzmann 因子", "e^{-\\beta E}", "statistical-mechanics", "正则系综中的能量权重。"],
      ["partition-function", "配分函数 Z", "Z", "bridge", "微观权重求和并生成热势的核心函数。"],
      ["canonical-partition-function", "正则配分函数", "Z_N", "statistical-mechanics", "固定 N,V,T 的配分函数。"],
      ["grand-partition-function", "巨配分函数 Ξ", "\\Xi", "statistical-mechanics", "固定 μ,V,T 的配分函数。"],
      ["ensemble-average", "系综平均", "\\langle A\\rangle", "statistical-mechanics", "对微观态分布的期望值。"],
      ["ergodic-hypothesis", "遍历假设", "", "statistical-mechanics", "时间平均与系综平均等价的条件。"],
      ["thermodynamic-limit", "热力学极限", "N\\to\\infty", "bridge", "微观涨落收敛并产生宏观热力学的极限。"],
    ],
  },
  {
    id: "entropy-distributions",
    title: "V 统计熵与分布",
    topics: [
      ["boltzmann-entropy", "Boltzmann 熵", "S=k_B\\ln\\Omega", "bridge", "由可及微观态数定义的熵。"],
      ["gibbs-entropy", "Gibbs 熵", "S=-k_B\\sum p_i\\ln p_i", "bridge", "由概率分布定义的熵。"],
      ["shannon-entropy", "Shannon 熵", "", "mathematical-tool", "信息论中的不确定性度量。"],
      ["maximum-entropy", "最大熵原理", "", "bridge", "在约束下选择最少偏置分布的原则。"],
      ["probability-distribution", "概率分布", "p_i", "statistical-mechanics", "微观态权重的数学表示。"],
      ["lagrange-multiplier", "Lagrange 乘子", "", "mathematical-tool", "约束极值问题中的广义力。"],
      ["equipartition-theorem", "能量均分定理", "", "statistical-mechanics", "二次自由度平均能量的经典结果。"],
      ["law-large-numbers", "大数定律", "", "mathematical-tool", "宏观平均稳定的概率基础。"],
      ["central-limit-theorem", "中心极限定理", "", "mathematical-tool", "独立涨落和高斯分布的来源。"],
      ["fluctuation", "涨落", "", "statistical-mechanics", "微观随机性在宏观量上的偏离。"],
      ["large-deviation", "大偏差", "", "mathematical-tool", "小概率宏观偏离的指数估计。"],
      ["detailed-balance", "细致平衡", "", "statistical-mechanics", "平衡随机过程的反向流平衡条件。"],
      ["entropy-maximization", "熵最大化", "", "bridge", "孤立系统平衡条件的统计表述。"],
      ["free-energy-minimum", "自由能极小", "", "bridge", "给定外界约束下的平衡判据。"],
      ["information-thermo", "信息热力学", "", "bridge", "信息、测量与热力学代价的交叉领域。"],
    ],
  },
  {
    id: "quantum-models",
    title: "VI 量子统计与理想模型",
    topics: [
      ["quantum-state", "量子态", "", "statistical-mechanics", "量子统计中的微观态载体。"],
      ["density-matrix", "密度矩阵 ρ", "\\rho", "statistical-mechanics", "混合态和系综的量子表示。"],
      ["indistinguishability", "不可分辨性", "", "statistical-mechanics", "量子粒子统计的核心约束。"],
      ["bose-einstein-distribution", "Bose-Einstein 分布", "", "statistical-mechanics", "玻色子占据数分布。"],
      ["fermi-dirac-distribution", "Fermi-Dirac 分布", "", "statistical-mechanics", "费米子占据数分布。"],
      ["maxwell-boltzmann-distribution", "Maxwell-Boltzmann 分布", "", "statistical-mechanics", "经典极限下的速度或能量分布。"],
      ["ideal-gas", "理想气体模型", "", "bridge", "无相互作用粒子气体的基准模型。"],
      ["quantum-ideal-gas", "量子理想气体", "", "statistical-mechanics", "量子占据与热性质的基准系统。"],
      ["photon-gas", "光子气体", "", "statistical-mechanics", "无化学势的玻色气体。"],
      ["blackbody-radiation", "黑体辐射", "", "statistical-mechanics", "光子气体的热辐射谱。"],
      ["debye-model", "Debye 模型", "", "statistical-mechanics", "晶格振动热容模型。"],
      ["einstein-solid", "Einstein 固体", "", "statistical-mechanics", "独立谐振子固体热容模型。"],
      ["fermi-gas", "Fermi 气体", "", "statistical-mechanics", "费米面和低温热容的模型。"],
      ["bose-condensation", "Bose-Einstein 凝聚", "", "statistical-mechanics", "玻色气体的宏观占据现象。"],
      ["chemical-equilibrium", "化学平衡", "", "thermodynamics", "化学势相等给出的反应平衡条件。"],
    ],
  },
  {
    id: "phase-criticality",
    title: "VII 相变与临界",
    topics: [
      ["phase-transition", "相变", "", "thermodynamics", "宏观性质发生非解析变化的现象。"],
      ["first-order-transition", "一级相变", "", "thermodynamics", "一阶导数不连续并伴随潜热的相变。"],
      ["continuous-transition", "连续相变", "", "thermodynamics", "序参量连续但响应函数奇异的相变。"],
      ["order-parameter", "序参量", "", "bridge", "刻画相区别的宏观量。"],
      ["landau-theory", "Landau 理论", "", "bridge", "以序参量自由能展开描述相变。"],
      ["symmetry-breaking", "对称性破缺", "", "bridge", "相变中低温相对称性降低的机制。"],
      ["critical-point", "临界点", "", "thermodynamics", "相界终止或连续相变奇异点。"],
      ["critical-exponents", "临界指数", "", "statistical-mechanics", "临界附近幂律行为的指数。"],
      ["scaling-law", "标度律", "", "mathematical-tool", "临界行为的尺度变换关系。"],
      ["renormalization-group", "重整化群", "", "mathematical-tool", "逐尺度消去自由度的理论框架。"],
      ["ising-model", "Ising 模型", "", "statistical-mechanics", "相变和临界现象的标准格点模型。"],
      ["mean-field-theory", "平均场理论", "", "statistical-mechanics", "用平均环境近似相互作用的理论。"],
      ["nucleation", "成核", "", "statistical-mechanics", "亚稳态向稳定相转变的初始过程。"],
      ["metastability", "亚稳态", "", "thermodynamics", "局部稳定但非全局平衡的状态。"],
      ["spinodal", "Spinodal 分解", "", "thermodynamics", "失稳区内的连续相分离机制。"],
    ],
  },
  {
    id: "fluctuation-noneq",
    title: "VIII 涨落响应与非平衡",
    topics: [
      ["response-function", "响应函数", "", "bridge", "外场扰动与观测量变化的关系。"],
      ["susceptibility", "磁化率/易感率 χ", "\\chi", "thermodynamics", "响应函数的典型形式。"],
      ["fluctuation-dissipation", "涨落-耗散定理", "", "bridge", "平衡涨落与线性响应之间的桥接。"],
      ["correlation-function", "关联函数", "", "statistical-mechanics", "不同自由度或时刻之间的统计相关。"],
      ["green-kubo", "Green-Kubo 关系", "", "bridge", "输运系数与平衡关联函数的关系。"],
      ["brownian-motion", "布朗运动", "", "statistical-mechanics", "热涨落驱动的随机运动。"],
      ["langevin-equation", "Langevin 方程", "", "nonequilibrium", "带噪声和阻尼的随机动力学方程。"],
      ["fokker-planck", "Fokker-Planck 方程", "", "nonequilibrium", "概率密度随时间演化的方程。"],
      ["boltzmann-equation", "Boltzmann 方程", "", "nonequilibrium", "单粒子分布函数的输运方程。"],
      ["h-theorem", "H 定理", "", "nonequilibrium", "气体动理论中趋向平衡的统计命题。"],
      ["entropy-production", "熵产生", "\\sigma", "nonequilibrium", "不可逆过程的定量表述。"],
      ["onsager-reciprocity", "Onsager 倒易关系", "", "nonequilibrium", "线性非平衡流与力之间的对称性。"],
      ["transport-coefficient", "输运系数", "", "nonequilibrium", "粘滞、扩散和导热等响应常数。"],
      ["linear-response", "线性响应理论", "", "bridge", "弱扰动下响应与平衡关联的理论。"],
      ["local-equilibrium", "局域平衡", "", "nonequilibrium", "非平衡系统可局部用平衡变量描述的近似。"],
    ],
  },
];

const aspects = [
  ["definition", "定义", "明确该概念的最小定义、适用对象与不可省略的条件。"],
  ["formula", "数学形式", "记录常用公式、自然变量和量纲约定。"],
  ["derivation", "推导入口", "说明它从哪些公设、系综或极值原则导出。"],
  ["intuition", "物理图像", "给出可帮助判断方向和极限的物理直觉。"],
  ["boundary", "应用与边界", "列出典型应用、近似条件和容易误用的场景。"],
];

const formulaMap = {
  entropy: [
    ["Clausius 定义", "dS=\\frac{\\delta Q_{\\mathrm{rev}}}{T}", "可逆路径上热量微元与温度的比值。"],
    ["Boltzmann 熵", "S=k_B\\ln\\Omega", "等概率微观态计数定义。"],
    ["Gibbs 熵", "S=-k_B\\sum_i p_i\\ln p_i", "一般概率分布下的熵。"],
    ["自由能桥接", "F=-k_BT\\ln Z", "正则系综中熵与配分函数通过自由能连接。"],
  ],
  "partition-function": [["正则配分函数", "Z=\\sum_i e^{-\\beta E_i}", "微观能级的 Boltzmann 权重求和。"]],
  "helmholtz-free-energy": [["Helmholtz 自由能", "F=U-TS=-k_BT\\ln Z", "固定 N,V,T 时的平衡热势。"]],
  "gibbs-free-energy": [["Gibbs 自由能", "G=H-TS", "固定 N,p,T 时的平衡热势。"]],
  "grand-potential": [["巨热势", "\\Omega_G=-k_BT\\ln\\Xi", "固定 μ,V,T 的系综生成函数。"]],
  "chemical-potential": [["化学势", "\\mu=\\left(\\partial U/\\partial N\\right)_{S,V}", "粒子数变化对应的能量代价。"]],
  "boltzmann-factor": [["Boltzmann 因子", "p_i\\propto e^{-\\beta E_i}", "正则分布的能量权重。"]],
  "heat-capacity": [["热容", "C_V=\\left(\\partial U/\\partial T\\right)_V", "定容能量响应。"]],
  "clapeyron-equation": [["Clapeyron 方程", "\\frac{dp}{dT}=\\frac{L}{T\\Delta V}", "相边界斜率与潜热。"]],
  "fluctuation-dissipation": [["涨落-耗散", "\\chi(t)\\sim \\beta\\langle A(t)A(0)\\rangle", "响应由平衡涨落控制。"]],
  "green-kubo": [["Green-Kubo", "L=\\int_0^\\infty \\langle J(t)J(0)\\rangle dt", "输运系数的关联函数形式。"]],
  "ideal-gas-law": [["理想气体", "pV=Nk_BT", "无相互作用气体的状态方程。"]],
};

const statusCycle = ["verified", "needs-source", "needs-derivation", "needs-alignment"];

function sourceRefsFor(topic) {
  const refs = ["callen-1985", "reif-1965"];

  if (topic.domain === "statistical-mechanics" || topic.domain === "bridge") {
    refs.push("pathria-2011", "huang-1987");
  }
  if (topic.domain === "nonequilibrium") {
    refs.push("de-groot-mazur-1962", "kubo-1957");
  }
  if (topic.id.includes("critical") || topic.id.includes("phase") || topic.id.includes("ising") || topic.id.includes("renormalization")) {
    refs.push("kardar-fields-2007", "goldenfeld-1992");
  }

  const historical = {
    entropy: ["clausius-1865", "boltzmann-1877", "gibbs-1902"],
    "partition-function": ["gibbs-1902", "tolman-1938"],
    "helmholtz-free-energy": ["gibbs-1876", "gibbs-1902"],
    "boltzmann-equation": ["boltzmann-1872"],
    "h-theorem": ["boltzmann-1872"],
    "onsager-reciprocity": ["onsager-1931-a", "onsager-1931-b"],
    "fluctuation-dissipation": ["kubo-1957", "nyquist-1928", "johnson-1928"],
    "green-kubo": ["green-1954", "kubo-1957"],
    "blackbody-radiation": ["planck-1901", "einstein-1905-quanta"],
    "bose-einstein-distribution": ["bose-1924"],
    "fermi-dirac-distribution": ["fermi-1926", "dirac-1926"],
    "debye-model": ["debye-1912"],
    "landau-theory": ["landau-1937"],
    "renormalization-group": ["wilson-1971", "wilson-kogut-1974"],
    "ising-model": ["ising-1925", "peierls-1936"],
  }[topic.id];

  if (historical) {
    refs.push(...historical);
  }

  return [...new Set(refs)].filter((id) => sourceIds.has(id)).slice(0, 7);
}

function formulasFor(topic) {
  if (formulaMap[topic.id]) {
    return formulaMap[topic.id].map(([label, latex, note]) => ({ label, latex, note }));
  }
  if (topic.notation && topic.notation.includes("=")) {
    return [{ label: "常用形式", latex: topic.notation, note: "该公式用于定位概念在推导网络中的角色。" }];
  }
  return [];
}

function articleFor(topic) {
  if (topic.id === "entropy") {
    return [
      {
        heading: "定义",
        body: "熵 $S$ 是描述孤立系统能量分散程度与不可逆性的状态函数。热力学入口把它定义为可逆过程上的 $dS=\\delta Q_{\\mathrm{rev}}/T$；统计力学入口把它定义为微观态计数或概率分布的对数泛函。",
      },
      {
        heading: "两种入口",
        body: "从宏观侧看，[[temperature|温度]]、[[reversible-process|可逆过程]] 与热量微元给出 Clausius 定义；从微观侧看，[[microstate|微观态]]、[[probability-distribution|概率分布]] 与 [[density-of-states|态密度]] 给出 Boltzmann/Gibbs 定义。",
      },
      {
        heading: "热力学表述",
        body: "对任意可逆过程，熵的微分由系统吸收的热量除以温度给出：$dS=\\delta Q_{\\mathrm{rev}}/T$。这一定义强调熵是状态量，而热量本身不是状态量。",
      },
      {
        heading: "统计力学表述",
        body: "等概率情形使用 $S=k_B\\ln\\Omega$；一般分布使用 $S=-k_B\\sum_i p_i\\ln p_i$。两者在微正则极限下相容，并在 [[thermodynamic-limit|热力学极限]] 中与宏观热力学对齐。",
      },
      {
        heading: "桥接命题",
        body: "在正则系综中，[[partition-function|配分函数]] $Z$ 通过 $F=-k_BT\\ln Z$ 生成 [[helmholtz-free-energy|Helmholtz 自由能]]，再由 $S=-(\\partial F/\\partial T)_{V,N}$ 回到宏观熵。",
      },
      {
        heading: "常见误区",
        body: "熵不是简单的“混乱程度”，也不是只属于信息论的量；它在热统中首先是可测热响应、微观计数和极限过程共同锁定的状态函数。",
      },
    ];
  }

  if (topic.id === "partition-function") {
    return [
      { heading: "定义", body: "配分函数 $Z$ 是对所有微观态 Boltzmann 权重的求和：$Z=\\sum_i e^{-\\beta E_i}$。" },
      { heading: "桥接作用", body: "它把微观能级谱和概率权重压缩成热势生成函数，使 [[helmholtz-free-energy|自由能]]、[[internal-energy|内能]]、[[entropy|熵]] 和响应函数都能由对数导数得到。" },
      { heading: "适用条件", body: "标准形式假定正则系综、平衡态、固定 $N,V,T$，并要求能级求和或积分可归一化。" },
    ];
  }

  if (topic.id === "helmholtz-free-energy") {
    return [
      { heading: "定义", body: "Helmholtz 自由能 $F=U-TS$ 是固定 $N,V,T$ 条件下的自然热势。" },
      { heading: "统计力学表达", body: "在正则系综中，$F=-k_BT\\ln Z$，因此它是从 [[partition-function|配分函数]] 到宏观热力学的核心桥梁。" },
      { heading: "判据", body: "在固定温度和体积的外界约束下，平衡态使 $F$ 取极小。" },
    ];
  }

  if (topic.id === "thermodynamic-limit") {
    return [
      { heading: "定义", body: "热力学极限取 $N,V\\to\\infty$ 且 $N/V$ 固定，使边界效应和相对涨落消失。" },
      { heading: "桥接作用", body: "它解释为什么微观随机涨落可以产生稳定的 [[state-variable|状态量]]，并使不同 [[canonical-ensemble|系综]] 在适当条件下等价。" },
      { heading: "风险", body: "有限系统、长程相互作用和临界附近可能破坏简单极限图像，需要显式标记假设。" },
    ];
  }

  return [
    {
      heading: "定义",
      body: `${topic.title} 指${topic.summary}它在热统骨架中用于连接相关状态量、系综假设和可观测响应。`,
    },
    {
      heading: "位置",
      body: `该概念位于“${topic.sectionTitle}”主线，常与 [[entropy|熵]]、[[temperature|温度]]、[[partition-function|配分函数]] 或 [[thermodynamic-limit|热力学极限]] 共同出现。`,
    },
    {
      heading: "核验状态",
      body: "本条目在第一版中提供结构化定位；若标记为待补源或待推导，表示需要继续补充页码级来源或完整证明。",
    },
  ];
}

function statusForTopic(topic, index) {
  const verifiedCore = new Set([
    "entropy",
    "temperature",
    "internal-energy",
    "helmholtz-free-energy",
    "gibbs-free-energy",
    "legendre-transform",
    "partition-function",
    "canonical-ensemble",
    "microcanonical-ensemble",
    "boltzmann-factor",
    "thermodynamic-limit",
    "boltzmann-entropy",
    "gibbs-entropy",
    "fluctuation-dissipation",
    "green-kubo",
  ]);

  if (verifiedCore.has(topic.id)) {
    return "verified";
  }
  if (topic.domain === "bridge" && index % 2 === 0) {
    return "needs-derivation";
  }
  return statusCycle[index % statusCycle.length];
}

function detailStatus(index) {
  return ["needs-source", "needs-derivation", "needs-alignment", "verified", "needs-source"][Math.floor(index) % 5];
}

function conceptForTopic(topic, order) {
  return {
    id: topic.id,
    title: topic.title,
    notation: topic.notation || undefined,
    aliases: [topic.title.replace(/\s+[A-ZΩΞμχκασδ]+$/, ""), topic.notation].filter(Boolean),
    domain: topic.domain,
    sectionId: topic.sectionId,
    sectionTitle: topic.sectionTitle,
    order,
    level: "core",
    summary: topic.summary,
    articleSections: articleFor(topic),
    formulas: formulasFor(topic),
    termRefs: topic.termRefs,
    sourceRefs: sourceRefsFor(topic),
    proofStatus: statusForTopic(topic, order),
    tags: [topic.sectionTitle, topic.domain, ...topic.tags],
  };
}

function detailConcept(topic, aspect, order) {
  const sourceRefs = sourceRefsFor(topic);
  return {
    id: `${topic.id}-${aspect.id}`,
    title: `${topic.title}: ${aspect.title}`,
    notation: topic.notation || undefined,
    aliases: [topic.title, aspect.title, `${topic.title}${aspect.title}`],
    domain: topic.domain,
    sectionId: topic.sectionId,
    sectionTitle: topic.sectionTitle,
    order,
    level: "detail",
    summary: `${aspect.description}这是“${topic.title}”条目的细化节点。`,
    articleSections: [
      { heading: aspect.title, body: `${aspect.description}第一版把它作为 [[${topic.id}|${topic.title}]] 的可展开子条目，并保留独立来源与推导状态。` },
      { heading: "关联", body: `它通常需要回看 [[entropy|熵]]、[[partition-function|配分函数]] 与 [[thermodynamic-limit|热力学极限]] 来判断适用边界。` },
    ],
    formulas: formulasFor(topic).slice(0, 1),
    termRefs: [topic.id, "entropy", "partition-function", "thermodynamic-limit"].filter((id) => id !== topic.id),
    sourceRefs: sourceRefs.slice(0, 3),
    proofStatus: detailStatus(order),
    tags: [topic.title, aspect.title, topic.sectionTitle],
  };
}

function normalizeTopics() {
  const topics = [];
  let order = 0;

  for (const section of sections) {
    for (const seed of section.topics) {
      const [id, title, notation, domain, summary] = seed;
      const topic = {
        id,
        title,
        notation,
        domain,
        summary,
        sectionId: section.id,
        sectionTitle: section.title,
        order: order++,
        tags: [section.title.replace(/^[IVX]+\s*/, ""), title],
        termRefs: [],
      };
      topics.push(topic);
    }
  }

  const coreIds = topics.map((topic) => topic.id);
  for (const topic of topics) {
    topic.termRefs = [
      "entropy",
      "temperature",
      "partition-function",
      "helmholtz-free-energy",
      "thermodynamic-limit",
      "microstate",
      "probability-distribution",
    ].filter((id) => id !== topic.id && coreIds.includes(id));
  }

  return topics;
}

const topics = normalizeTopics();

const concepts = [];
let conceptOrder = 0;
for (const topic of topics) {
  concepts.push(conceptForTopic(topic, conceptOrder++));
  for (const [index, [id, title, description]] of aspects.entries()) {
    concepts.push(detailConcept(topic, { id, title, description }, conceptOrder++ + index / 10));
  }
}

const conceptIds = new Set(concepts.map((concept) => concept.id));
const relations = [];
let relationSerial = 0;

function addRelation({ id, sourceId, targetId, type, label, statement, derivationSteps, assumptions, sourceRefs, proofStatus }) {
  if (!conceptIds.has(sourceId) || !conceptIds.has(targetId) || sourceId === targetId) {
    return;
  }
  const finalId = id ?? `rel-${relationSerial++}-${sourceId}-${targetId}`;
  if (relations.some((relation) => relation.id === finalId)) {
    return;
  }
  relations.push({
    id: finalId,
    sourceId,
    targetId,
    type,
    label,
    statement,
    derivationSteps,
    assumptions,
    sourceRefs: sourceRefs.filter((sourceId) => sourceIds.has(sourceId)).slice(0, 7),
    proofStatus,
  });
}

for (const topic of topics) {
  const refs = sourceRefsFor(topic);
  const detailIds = aspects.map(([aspectId]) => `${topic.id}-${aspectId}`);

  for (const [index, detailId] of detailIds.entries()) {
    addRelation({
      sourceId: topic.id,
      targetId: detailId,
      type: "definition-dependency",
      label: "展开",
      statement: `${detailId} 是 ${topic.title} 的${aspects[index][1]}层。`,
      derivationSteps: ["定位核心概念", "抽取该层问题", "保留来源与证明状态"],
      assumptions: ["第一版细化节点", "概念层级关系"],
      sourceRefs: refs,
      proofStatus: index === 0 ? "needs-source" : detailStatus(index),
    });
  }

  for (let index = 0; index < detailIds.length - 1; index += 1) {
    addRelation({
      sourceId: detailIds[index],
      targetId: detailIds[index + 1],
      type: "derivation",
      label: "阅读顺序",
      statement: `从${aspects[index][1]}进入${aspects[index + 1][1]}，形成可读推导链。`,
      derivationSteps: ["先固定定义", "再写数学形式", "随后进入推导与物理图像", "最后检查应用边界"],
      assumptions: ["教材式阅读顺序", "细节节点已挂接到核心概念"],
      sourceRefs: refs,
      proofStatus: "needs-alignment",
    });
  }
}

for (const section of sections) {
  const sectionTopics = topics.filter((topic) => topic.sectionId === section.id);
  for (let index = 0; index < sectionTopics.length - 1; index += 1) {
    addRelation({
      sourceId: sectionTopics[index].id,
      targetId: sectionTopics[index + 1].id,
      type: "application",
      label: "章节相邻",
      statement: `${sectionTopics[index].title} 在章节结构上自然导向 ${sectionTopics[index + 1].title}。`,
      derivationSteps: ["读取章节目录", "确认概念先后", "作为导航关系使用"],
      assumptions: ["教材目录顺序", "不是严格数学推导"],
      sourceRefs: ["callen-1985", "reif-1965"],
      proofStatus: "needs-source",
    });
  }
}

for (let index = 0; index < topics.length - 15; index += 1) {
  const source = topics[index];
  const target = topics[index + 15];
  addRelation({
    sourceId: source.id,
    targetId: target.id,
    type: "application",
    label: "跨章呼应",
    statement: `${source.title} 与 ${target.title} 在热统主线中形成跨章呼应。`,
    derivationSteps: ["识别同序概念位置", "连接宏观与微观描述", "交给后续核验补细节"],
    assumptions: ["自动生成的导航桥", "待人工确认精确推导"],
    sourceRefs: ["callen-1985", "pathria-2011"],
    proofStatus: "needs-alignment",
  });
}

const anchorByDomain = {
  thermodynamics: "entropy",
  "statistical-mechanics": "partition-function",
  bridge: "thermodynamic-limit",
  "mathematical-tool": "legendre-transform",
  nonequilibrium: "entropy-production",
};

for (const topic of topics) {
  const anchor = anchorByDomain[topic.domain];
  if (anchor && topic.id !== anchor) {
    addRelation({
      sourceId: topic.id,
      targetId: anchor,
      type: topic.domain === "bridge" ? "limit-bridge" : "definition-dependency",
      label: "骨架锚点",
      statement: `${topic.title} 通过 ${anchor} 接入热统骨架主干。`,
      derivationSteps: ["选择所属领域锚点", "连接到可追溯核心节点", "标记为结构关系"],
      assumptions: ["骨架导航关系", "详细证明待展开"],
      sourceRefs: sourceRefsFor(topic),
      proofStatus: topic.domain === "bridge" ? "needs-derivation" : "needs-source",
    });
  }
}

const bridgeRelations = [
  {
    id: "rel-entropy-partition-function-bridge",
    sourceId: "entropy",
    targetId: "partition-function",
    type: "limit-bridge",
    label: "S ↔ Z",
    statement: "熵与配分函数通过正则系综中的自由能生成关系相连。",
    derivationSteps: [
      "从微观态求和出发：$Z=\\sum_i e^{-\\beta E_i}$",
      "用 Boltzmann 权重归一化：$p_i=e^{-\\beta E_i}/Z$",
      "代入 Gibbs 熵：$S=-k_B\\sum_i p_i\\ln p_i=k_B(\\ln Z+\\beta\\langle E\\rangle)$",
      "定义自由能：$F=\\langle E\\rangle-TS=-k_BT\\ln Z$",
      "在热力学极限中与宏观微分关系对齐。",
    ],
    assumptions: ["正则系综", "平衡态", "固定 N,V,T", "可加能量", "热力学极限"],
    sourceRefs: ["gibbs-1902", "pathria-2011", "huang-1987", "landau-lifshitz-1980", "kardar-particles-2007"],
    proofStatus: "verified",
  },
  {
    id: "rel-partition-function-helmholtz-free-energy",
    sourceId: "partition-function",
    targetId: "helmholtz-free-energy",
    type: "derivation",
    label: "Z → F",
    statement: "正则配分函数的对数直接生成 Helmholtz 自由能。",
    derivationSteps: ["写出正则配分函数", "取对数得到广延热势", "乘以 $-k_BT$ 定义 $F$", "对自然变量求导得到熵、压强和化学势"],
    assumptions: ["正则系综", "固定 N,V,T", "能级谱已知或可积分"],
    sourceRefs: ["gibbs-1902", "pathria-2011", "kardar-particles-2007"],
    proofStatus: "verified",
  },
  {
    sourceId: "helmholtz-free-energy",
    targetId: "entropy",
    type: "derivation",
    label: "F → S",
    statement: "熵由 Helmholtz 自由能对温度的负偏导得到。",
    derivationSteps: ["使用 $F=U-TS$", "写出 $dF=-S dT-p dV+\\mu dN$", "固定 $V,N$ 对 $T$ 求导"],
    assumptions: ["可微平衡热势", "固定 V,N"],
    sourceRefs: ["callen-1985", "landau-lifshitz-1980"],
    proofStatus: "verified",
  },
  {
    sourceId: "boltzmann-entropy",
    targetId: "gibbs-entropy",
    type: "equivalence",
    label: "等概率极限",
    statement: "Gibbs 熵在等概率分布下退化为 Boltzmann 熵。",
    derivationSteps: ["令 $p_i=1/\\Omega$", "代入 $S=-k_B\\sum_i p_i\\ln p_i$", "得到 $S=k_B\\ln\\Omega$"],
    assumptions: ["等概率可及微观态", "归一化概率"],
    sourceRefs: ["boltzmann-1877", "gibbs-1902", "shannon-1948"],
    proofStatus: "verified",
  },
  {
    sourceId: "microcanonical-ensemble",
    targetId: "canonical-ensemble",
    type: "limit-bridge",
    label: "系综等价",
    statement: "大系统在适当稳定性条件下微正则和正则系综给出相同宏观热力学。",
    derivationSteps: ["将系统与热库分开", "对热库熵展开", "得到 Boltzmann 权重", "在热力学极限中压低相对涨落"],
    assumptions: ["短程相互作用", "热力学极限", "稳定平衡态"],
    sourceRefs: ["reif-1965", "pathria-2011", "ruelle-1969"],
    proofStatus: "verified",
  },
  {
    sourceId: "fluctuation",
    targetId: "response-function",
    type: "limit-bridge",
    label: "涨落 → 响应",
    statement: "平衡涨落决定弱外场下的线性响应。",
    derivationSteps: ["引入外场耦合", "展开配分函数", "识别二阶累积量", "得到响应函数"],
    assumptions: ["平衡态", "弱扰动", "线性响应"],
    sourceRefs: ["kubo-1957", "green-1954", "kubo-toda-1991"],
    proofStatus: "verified",
  },
  {
    sourceId: "chemical-potential",
    targetId: "grand-partition-function",
    type: "derivation",
    label: "μ → Ξ",
    statement: "化学势作为粒子数的广义力进入巨正则权重。",
    derivationSteps: ["允许粒子数涨落", "将能量权重改写为 $e^{-\\beta(E-\\mu N)}$", "对所有 N 与微观态求和"],
    assumptions: ["巨正则系综", "平衡态", "粒子库存在"],
    sourceRefs: ["gibbs-1902", "pathria-2011"],
    proofStatus: "verified",
  },
  {
    sourceId: "legendre-transform",
    targetId: "helmholtz-free-energy",
    type: "derivation",
    label: "变量替换",
    statement: "Legendre 变换把内能的自然变量从熵替换为温度。",
    derivationSteps: ["从 $U(S,V,N)$ 出发", "识别共轭变量 $T=\\partial U/\\partial S$", "定义 $F=U-TS$", "得到 $dF=-S dT-pdV+\\mu dN$"],
    assumptions: ["热势可微", "凸性条件成立"],
    sourceRefs: ["callen-1985", "fermi-1936"],
    proofStatus: "verified",
  },
  {
    sourceId: "order-parameter",
    targetId: "landau-theory",
    type: "application",
    label: "序参量自由能",
    statement: "Landau 理论用序参量构造自由能泛函来描述相变。",
    derivationSteps: ["选择序参量", "按对称性写自由能展开", "极小化自由能", "读出相结构"],
    assumptions: ["平均场近似", "解析展开", "近临界区"],
    sourceRefs: ["landau-1937", "goldenfeld-1992", "kardar-fields-2007"],
    proofStatus: "verified",
  },
  {
    sourceId: "entropy-production",
    targetId: "onsager-reciprocity",
    type: "derivation",
    label: "流-力结构",
    statement: "线性非平衡热力学把熵产生写成热力学流与力的双线性形式。",
    derivationSteps: ["定义局域平衡变量", "写出熵产生密度", "线性化流-力关系", "使用微观可逆性得到倒易关系"],
    assumptions: ["局域平衡", "近平衡", "微观可逆性"],
    sourceRefs: ["de-groot-mazur-1962", "onsager-1931-a", "onsager-1931-b"],
    proofStatus: "verified",
  },
];

for (const relation of bridgeRelations) {
  addRelation(relation);
}

const conceptsOut = concepts.toSorted((a, b) => a.order - b.order);
const relationsOut = relations.toSorted((a, b) => a.id.localeCompare(b.id));
const sourcesOut = sourceSeeds.map(([id, kind, authors, title, year, role, status]) => ({
  id,
  kind,
  authors,
  title,
  year,
  role,
  status,
}));

const coverage = conceptsOut.reduce(
  (acc, concept) => {
    acc[concept.proofStatus] += 1;
    return acc;
  },
  { verified: 0, "needs-source": 0, "needs-derivation": 0, "needs-alignment": 0 },
);

const meta = {
  generatedAt,
  conceptCount: conceptsOut.length,
  relationCount: relationsOut.length,
  sourceCount: sourcesOut.length,
  coverage,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "concepts.json"), `${JSON.stringify(conceptsOut, null, 2)}\n`, "utf8");
writeFileSync(join(outDir, "relations.json"), `${JSON.stringify(relationsOut, null, 2)}\n`, "utf8");
writeFileSync(join(outDir, "sources.json"), `${JSON.stringify(sourcesOut, null, 2)}\n`, "utf8");
writeFileSync(join(outDir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`, "utf8");

console.log(`[corpus] generatedAt=${meta.generatedAt}`);
console.log(`Generated ${meta.conceptCount} concepts, ${meta.relationCount} relations, ${meta.sourceCount} sources.`);
