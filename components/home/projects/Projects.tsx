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
    title: "Proompter",
    imgSrc: "/project-imgs/proompter.png",
    code: "https://github.com/osman-sultan/proompter",
    projectLink: "https://projectproompter.vercel.app/",
    tech: ["Next.js 13", "TailwindCSS", "MongoDB", "NextAuth.js"],
    description: "Open source prompt sharing repository to power your LLM's",
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
          In this project, inspired by Brazil&apos;s loss in the 2014 World Cup
          due to Neymar&apos;s injury, I used machine learning to predict soccer
          injuries, and important yet overlooked facet of the beautiful game.
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
];
