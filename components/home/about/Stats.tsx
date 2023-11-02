import { Reveal } from "@/components/utils/Reveal";
import { AiFillCode, AiFillSmile } from "react-icons/ai";
import { FaBrain, FaCode, FaToolbox } from "react-icons/fa";
import styles from "./stats.module.scss";

export const Stats = () => {
  return (
    <div className={styles.stats}>
      <Reveal>
        <div className={styles.statColumn}>
          <h4>
            <FaBrain size="2.4rem" color="var(--brand)" />
            <span>Languages</span>
          </h4>
          <div className={styles.statGrid}>
            <span className="chip">Python</span>
            <span className="chip">JavaScript</span>
            <span className="chip">TypeScript</span>
            <span className="chip">Java</span>
            <span className="chip">SQL</span>
            <span className="chip">C++</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className={styles.statColumn}>
          <h4>
            <FaCode size="2.4rem" color="var(--brand)" />
            <span>Frameworks</span>
          </h4>
          <div className={styles.statGrid}>
            <span className="chip">React.js</span>
            <span className="chip">Vue.js</span>
            <span className="chip">Next.js</span>
            <span className="chip">Node.js</span>
            <span className="chip">Express.js</span>
            <span className="chip">Spring Boot</span>
            <span className="chip">FastAPI</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className={styles.statColumn}>
          <h4>
            <FaToolbox size="2.4rem" color="var(--brand)" />
            <span>ML and Data Analysis</span>
          </h4>
          <div className={styles.statGrid}>
            <span className="chip">NumPy</span>
            <span className="chip">Pandas</span>
            <span className="chip">Matplotlib</span>
            <span className="chip">Seaborn</span>
            <span className="chip">Scikit-learn</span>
            <span className="chip">PyTorch</span>
            <span className="chip">Langchain</span>
            <span className="chip">Hugging Face</span>
            <span className="chip">Replicate</span>
            <span className="chip">PineconeDB</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className={styles.statColumn}>
          <h4>
            <AiFillCode size="2.4rem" color="var(--brand)" />
            <span>Web tools</span>
          </h4>
          <div className={styles.statGrid}>
            <span className="chip">TailwindCSS</span>
            <span className="chip">Bootstrap5</span>
            <span className="chip">ShadCN UI</span>
            <span className="chip">Vite</span>
            <span className="chip">NextAuth.js</span>
            <span className="chip">Clerk</span>
            <span className="chip">ESLint</span>
            <span className="chip">Prisma</span>
            <span className="chip">Zustand</span>
            <span className="chip">Zod</span>
            <span className="chip">Tanstack Query</span>
            <span className="chip">Storybook</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className={styles.statColumn}>
          <h4>
            <AiFillCode size="2.4rem" color="var(--brand)" />
            <span>Infrastructure</span>
          </h4>
          <div className={styles.statGrid}>
            <span className="chip">MongoDB</span>
            <span className="chip">Firebase</span>
            <span className="chip">Supabase</span>
            <span className="chip">AWS S3</span>
            <span className="chip">Redis</span>
            <span className="chip">SQL</span>
            <span className="chip">SQLite</span>
            <span className="chip">MySQL</span>
            <span className="chip">PostgreSQL</span>
            <span className="chip">Vercel</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className={styles.statColumn}>
          <h4>
            <AiFillSmile size="2.4rem" color="var(--brand)" />
            <span>Other Tools</span>
          </h4>
          <div className={styles.statGrid}>
            <span className="chip">Git</span>
            <span className="chip">GitHub/GitLab</span>
            <span className="chip">Bash</span>
            <span className="chip">PowerShell</span>
            <span className="chip">Linux</span>
            <span className="chip">Ubuntu</span>
            <span className="chip">Docker</span>
            <span className="chip">WSL</span>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
