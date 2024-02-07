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
            <span className="chip">TypeScript</span>
            <span className="chip">Java</span>
            <span className="chip">SQL</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className={styles.statColumn}>
          <h4>
            <FaCode size="2.4rem" color="var(--brand)" />
            <span>Web</span>
          </h4>
          <div className={styles.statGrid}>
            <span className="chip">React.js</span>
            <span className="chip">Next.js</span>
            <span className="chip">Vue.js</span>
            <span className="chip">Node.js</span>
            <span className="chip">Spring Boot</span>
            <span className="chip">FastAPI</span>
            <span className="chip">TailwindCSS</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className={styles.statColumn}>
          <h4>
            <FaToolbox size="2.4rem" color="var(--brand)" />
            <span>Machine Learning</span>
          </h4>
          <div className={styles.statGrid}>
            <span className="chip">NumPy/Pandas</span>
            <span className="chip">Matplotlib/Seaborn</span>
            <span className="chip">Scikit-learn</span>
            <span className="chip">PyTorch</span>
            <span className="chip">Langchain</span>
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
            <span className="chip">Redis</span>
            <span className="chip">SQLite</span>
            <span className="chip">MySQL</span>
            <span className="chip">PostgreSQL</span>
            <span className="chip">Supabase</span>
            <span className="chip">MongoDB</span>
            <span className="chip">AWS S3/Lambda</span>
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
            <span className="chip">Bash</span>
            <span className="chip">Linux</span>
            <span className="chip">Docker</span>
            <span className="chip">Ngrok</span>
            <span className="chip">Postman</span>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
