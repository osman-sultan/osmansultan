import { SectionHeader } from "@/components/utils/SectionHeader";
import { Project } from "./Project";
import styles from "./projects.module.scss";

export const Projects = () => {
  return (
    <section className="section-wrapper" id="projects">
      <SectionHeader title="projects" dir="r" />

      <div className={styles.projects}>
        {projects.map((project) => {
          return <Project key={project.title} {...project} />;
        })}
      </div>
    </section>
  );
};

const projects = [
  {
    title: "TerraSculpt",
    imgSrc: "/project-imgs/terrasculpt.png",
    code: "https://github.com/osman-sultan/TerraSculpt",
    projectLink: "",
    tech: ["Python", "PyTorch", "TorchVision", "Matplotlib", "CUDA"],
    description:
      "An ML pipeline for landscape generation and classification. Leveraged unique takes on VAE and EfficientNetV2 models. A prospective journey into land-use planning.",
    modalContent: (
      <>
        <p>
          I developed a machine learning pipeline using PyTorch to generate and
          classify artificial landscape images; my first exploration of deep
          learning
        </p>
        <p>
          The motivation behind this project was to uncover a novel layer in
          environmental monitoring and land-use planning by combining the power
          of the EfficientNetV2 architecture for classification and the
          Variational Autoencoder (VAE) for generation.
        </p>
        <p>
          Although there were challenges, such as the VAE producing blurry
          images and underperforming compared to the baseline generator, the
          project represented an insightful initial step towards leveraging
          computer vision for land monitoring purposes.
        </p>
        <p>
          It was my first attempt at uncovering the potential of combining
          generative and classification deep learning models within a unified
          pipeline.
        </p>
        <p style={{ fontStyle: "italic" }}>
          What I really mean is that I should have used a Vision Transfomer.
        </p>
      </>
    ),
  },
  {
    title: "CarKART Automotive Marketplace",
    imgSrc: "/project-imgs/carkart.png",
    code: "https://github.com/osman-sultan",
    projectLink: "",
    tech: ["Vue.js", "Vite", "Bootstrap5", "Spring Boot", "SQL"],
    description:
      "A fullstack e-commerce platform to compare, buy, sell, and trade cars.",
    modalContent: (
      <>
        <p>
          A straightforward marketplace to buy, sell, trade, and compare used
          and new automobiles. Lead a team of 7 as the lead software engineer in
          this project.
        </p>
        <p>
          Vue.js 3 (composition api) + Bootstrap5 configured with Vite for the{" "}
          <a href="https://github.com/osman-sultan/CarKART-FrontEnd">
            frontend
          </a>
          .Prototyped it in Figma.
        </p>
        <p>
          Spring Boot + H2 SQL for{" "}
          <a href="https://github.com/osman-sultan/CarKART-BackEnd">backend</a>.
        </p>
        <p>
          Implemented unit testing and testing suites to validate functionality
          and maintain code quality.
        </p>
        <p style={{ fontStyle: "italic" }}>
          This project served as a fun way learn backend fundementals (MVC,
          CRUD, and custom API endpoints) in a practical manor by combing it
          with something I love🚗.
        </p>
      </>
    ),
  },
  {
    title: "Proompter",
    imgSrc: "/project-imgs/proompter.png",
    code: "https://github.com/osman-sultan/proompter",
    projectLink: "https://projectproompter.vercel.app/",
    tech: ["Next.js 13", "TailwindCSS", "MongoDB", "NextAuth.js"],
    description: "Open source prompt sharing repository to power your LLM's.",
    modalContent: (
      <>
        <p>
          Engineered an open-source platform for sharing and discovering prompts
          aimed at enhancing the effectiveness of Large Language Models (LLMs).
        </p>
        <p>
          Leveraged technologies such as Next.js, MongoDB, Tailwind CSS, and
          NextAuth.js to facilitate seamless user interaction, streamlined
          authentication, and to foster community engagement around AI-driven
          language models
        </p>
        <p style={{ fontStyle: "italic" }}>
          Inspired by the rising significance of large language models like GPT
          and Bard, I created Proompter to emphasize the need for sharing
          high-quality prompts to optimize these models (garbage in = garbage
          out). Proompter was also an excuse to finally learn Nextjs 13 and its
          new app directory to utilize serverless API endpoints (sayonara MVC).
        </p>
      </>
    ),
  },

  {
    title: "This Website",
    imgSrc: "/project-imgs/portfolio.png",
    code: "https://github.com/osman-sultan/osmansultan",
    projectLink: "https://www.osmansultan.me",
    tech: ["Next.js 13", "TypeScript", "Sass", "Framer Motion", "Anime.js"],
    description: "In all its glory.",
    modalContent: (
      <>
        <p>
          The cool moving dots (click them) on the hero section were made with{" "}
          <a href="https://animejs.com/" target="_blank">
            anime.js
          </a>
          .
        </p>
        <p>
          The reveal on scroll animations were made with{" "}
          <a href="https://www.framer.com/motion/" target="_blank">
            framer motion
          </a>
          .
        </p>
        <p>The font I used is IBM Plex Mono.</p>
        <p>
          Colours: background: rgb(223, 204, 166), bg-opaque: rgba(223, 204, 166
          0.25), background-light: rgb(207, 171, 98), background-dark: rgb(223,
          204, 166), text: rgb(0, 0, 0), brand: rgb(0, 92, 0).
        </p>
        <p style={{ fontStyle: "italic" }}>
          Tried going for a forest, earthy vibe with the browns and greens. My
          friend said the font is cringe cause it screams &quot;i&apos;m a
          coder&quot; - do you agree?
        </p>
      </>
    ),
  },

  {
    title: "Underlying Factors in Soccer Injuries",
    imgSrc: "/project-imgs/soccerinjuries.png",
    code: "https://www.github.com",
    projectLink: "",
    tech: [
      "Python",
      "Scikit-learn",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "TensorFlow",
      "BeautifulSoup4",
    ],
    description:
      "Dove into soccer injury analytics, using ML tools to predict club success. Fine-tuned multiple models for better predictions. It's Money Ball meets physiotherapy.",
    modalContent: (
      <>
        <p>
          In this project, inspired by Brazil&apos;s loss in the 2014 World Cup
          due to Neymar&apos;s injury, I used machine learning to predict soccer
          injuries, an important yet overlooked facet of the beautiful game.
        </p>
        <p>
          After scraping data from Transfermarkt and FBREF, I tackled issues of
          class imbalance and low-correlation features using techniques like
          SMOTE oversampling, feature engineering, and feature scaling.
        </p>
        <p>
          I developed several models including logistic regression, random
          forest, and an ANN. Through extensive hyperparamter tuning through
          grid search and random search, the logistic regression model with L2
          loss stood out, demonstrating an impressive ROC AUC of 0.726 and a
          recall of 0.851.
        </p>
        <p>
          Despite early setbacks with low-correlation features and poor initial
          model performances, my investigation into soccer injuries made
          significant strides by successfully identified injury-prone players,
          like Neymar, and despite its tendency to overlabel healthy players as
          at-risk, it provided valuable insights, setting a promising foundation
          for future research into global datasets and additional relevant
          features.
        </p>
        <p style={{ fontStyle: "italic" }}>
          Motivation for this project is highly inspired by the movie Money Ball
          and my own love for Football.
        </p>
      </>
    ),
  },
  {
    title: "Metro.ca UI/UX Redesign",
    imgSrc: "/project-imgs/metro.png",
    code: "",
    projectLink:
      "https://www.figma.com/file/tdwsXc9MEZmhoZh29XSm42/Metro---Function-1?type=design&node-id=0-1&mode=design",
    tech: ["Figma"],
    description:
      "Reimagined the well known grocery stores online marketplace to make home delivery orders as easy as possible.",
    modalContent: (
      <>
        <p>
          Managed a 3-member team through a three-phase design cycle,
          successfully optimizing the online grocery shopping service&apos;s
          user interface, which resulted in a 35% increase in user satisfaction
          and a 20% uptick in user retention, based on human factors design
          principles.
        </p>
        <p>
          Executed a detailed task analysis of the existing interface using user
          data, addressing key shortcomings and developing 3 design
          alternatives. This culminated in a final low-fidelity prototype that
          reduced user task completion time by 50% and enhanced user efficiency
          by 25%.
        </p>
        <p>
          Undertook usability testing with Figma, assessing the prototype via
          qualitative and quantitative measures. The evaluation improved the
          prototype&apos;s usability by 40%, confirming its effectiveness and
          real-world applicability.
        </p>
        <p>
          Presented comprehensive reports and findings to the client throughout
          each phase, leading to 100% client satisfaction. As the Spokesperson,
          delivered a persuasive final presentation, paving the way for future
          project engagements.
        </p>
        <p style={{ fontStyle: "italic" }}>
          Going through Metro&apos;s current website was the spark that made me
          realize how significant UI/UX design and more importantly human-system
          interaction is.
        </p>
      </>
    ),
  },
  {
    title: "Stable Marriage Problem Solver",
    imgSrc: "/project-imgs/smp.png",
    code: "https://www.figma.com/file/tdwsXc9MEZmhoZh29XSm42/Metro---Function-1?type=design&node-id=0-1&mode=design",
    projectLink: "",
    tech: ["Java"],
    description: "Fun and relatable application of the Gale-Shapely Algorithm",
    modalContent: (
      <>
        <p>
          A fun implementation of the Gale-Shapley algorithm to solve the famous
          Stable Marriage Problem (SMP) using vanilla Java and OOP fundementals.
        </p>
        <p>
          This approach imagines SMP in a relatable context where students and
          schools represent the suitors and receivers (or vice versa).
        </p>
        <p>
          This program includes an indepth user-friendly CLI to provide the user
          with statistics and easy manipulation of the data.
        </p>
        <p>
          Provided in this repository are sample datasets of upto 2000
          participants, formatted in a specific manor, with sample test cases to
          support the robust nature of the scripts. However, feel free to
          develop your own datasets and inputs when running the program!
        </p>
        <p style={{ fontStyle: "italic" }}>
          On the off chance you find a bug, let me know :)
        </p>
      </>
    ),
  },
];
