import { MyLinks } from "@/components/nav/components/MyLinks";
import { Reveal } from "@/components/utils/Reveal";
import { SectionHeader } from "@/components/utils/SectionHeader";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Stats } from "./Stats";
import styles from "./about.module.scss";

export const About = () => {
  return (
    <section id="about" className="section-wrapper">
      <SectionHeader title="about" dir="l" />
      <div className={styles.about}>
        <div>
          <Reveal>
            <p className={`${styles.aboutText} ${styles.highlightFirstLetter}`}>
              hello world✌️, i&apos;m osman. i&apos;m a bit all over the place
              but my goal lies in making interactions between humans and tech as
              accesible as possible. based in the greater toronto area, i
              sometimes feel like a sponge🧽, absorbing all that I can from the
              many remarkable people around me.
            </p>
          </Reveal>
          <Reveal>
            <p className={styles.aboutText}>
              naturally, as an unfortunate victim of fomo, im a serial hobbie
              hopper. currently, my interests lie in walkable cities (as a
              mississauga native, you could probably guess why), cars (v8, v10,
              v12 powered ones), hogwarts legacy, and the thought that messi
              might play at bmo field.
            </p>
          </Reveal>
          <Reveal>
            <div>
              <p className={styles.aboutText} style={{ fontWeight: "bold" }}>
                now:
              </p>
              <p className={styles.aboutText}>
                i&apos;m a 3rd year industrial engineering major/ai minor at the
                university of toronto.
              </p>
              <p className={styles.aboutText}>
                leading a team of 4 in building websites for uoft-affiliated
                clubs/students at utfo
              </p>
              <p className={styles.aboutText}>
                focusing summer on learning new tech like nextjs and langchain
                by expanding my portfolio with cool projects, including this
                very website! curious about socially impactful ai for humans,
                many of my projects will revolve around the now dominant llm
                field.
              </p>
              <p className={styles.aboutText} style={{ fontWeight: "bold" }}>
                previously:
              </p>
              <p className={styles.aboutText}>interned at Molex LLC as a SWE</p>
              <p className={styles.aboutText}>
                taught some python, java, and sql i learned in highschool to
                novice 2nd year engineering students
              </p>
              <p className={styles.aboutText}>
                lead f!rosh week twice (and hopefully a third time this
                september), welcoming incoming 1st years in the awesomest way
                possible
              </p>
              <p className={styles.aboutText}>
                made STEM accesible to low-income communities with visions of
                science.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.links}>
              <div className={styles.linksText}>
                <span>continue the conversation:</span>
                <AiOutlineArrowRight />
              </div>
              <MyLinks />
            </div>
          </Reveal>
        </div>
        <Stats />
      </div>
    </section>
  );
};
