import { SectionHeader } from "@/components/utils/SectionHeader";
import { ExperienceItem } from "./ExperienceItem";

export const Experience = () => {
  return (
    <section className="section-wrapper" id="experience">
      <SectionHeader title="experience" dir="l" />
      {experience.map((item) => (
        <ExperienceItem key={item.title} {...item} />
      ))}
    </section>
  );
};

const experience = [
  {
    title: "UofT Freelancer's Organization",
    position: "Founding Member & Lead",
    time: "2021 - Present",
    location: "Toronto, ON",
    description: `Spearheaded a club focused on creating digital solutions for student-affiliated entities, delivering 5+ projects through a strict Agile Software Development Life Cycle (SDLC), accelerating project delivery timelines by 30%.\n
    Engineered dynamic, responsive, and SEO-friendly websites utilizing React.js, Bootstrap5, and CSS Flexbox for student-affiliated clubs, enhancing their digital presence and increasing user engagement by 40% on average.\n
    Managed project workflows via Git, GitHub Actions, and Jira, streamlining operations and ensuring consistently on-schedule delivery of high quality solutions`,
    tech: [
      "React.js",
      "HTML/CSS",
      "Bootstrap5",
      "Firebase",
      "GitHub",
      "Git",
      "Jira",
    ],
  },
  {
    title: "Molex LLC",
    position: "Software Engineering Intern",
    time: "Summer 2022",
    location: "Waterloo, ON",
    description: `Transformed a Linux-based CLI into a user-friendly web client using Python, FastAPI, and Jinja, reducing hardware testing times by 35% and boosting system performance by 25%.\n
    Enabled multi-user testing on the same hardware by utilizing Python’s asyncio library for asynchronous programming, resulting in an 80% increase in multi-user efficiency.\n
    Optimized internal testing processes by developing a solution tailored to specific hardware testing needs, significantly improving the team's productivity with a 20% increase in testing throughput.`,
    tech: ["Python", "Asyncio", "FastAPI", "Jinja", "GitLab", "Git", "Linux"],
  },
  {
    title: "Self-employed",
    position: "Coding Tutor",
    time: "2021-2022",
    location: "Toronto, ON",
    description: `Applied practical Python, Java, and SQL programming experience to guide 3-10 students weekly, contributing to an average grade increase of 50% in related coursework.\n
    Provided instruction on diverse set of topics including syntax, data types, object-oriented programming, joins, algorithms, big-O notation, and more, contributing to a 30% improvement in test scores on these topics.\n
    Successfully implemented tailored weekly tutorial sessions, fostering a shift in students' perspectives towards programming, with notable growth in both proficiency and passion for the subject.`,
    tech: ["Python", "Java", "SQL"],
  },
];
