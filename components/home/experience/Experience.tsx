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
    time: "2021 - 2022",
    location: "Toronto, ON",
    description: `Applied practical Python, Java, and SQL programming experience to guide 3-10 students weekly, contributing to an average grade increase of 50% in related coursework.\n
    Provided instruction on diverse set of topics including syntax, data types, object-oriented programming, joins, algorithms, big-O notation, and more, contributing to a 30% improvement in test scores on these topics.\n
    Successfully implemented tailored weekly tutorial sessions, fostering a shift in students' perspectives towards programming, with notable growth in both proficiency and passion for the subject.`,
    tech: ["Python", "Java", "SQL"],
  },
  {
    title: "Visions of Science",
    position: "Senior Club Facilitator",
    time: "2019 - 2020",
    location: "Mississauga, ON",
    description: `Facilitated diverse STEM modules for over 20 local youth aged 6-13, covering topics from model bridge engineering to climate change exploration. This approach led to a 30% improvement in understanding of STEM concepts, as measured through pre and post module assessments.\n
    Directed a team of 7 facilitators, effectively managing task delegation, resulting in a 20% improvement in overall team productivity and a 100% completion rate of modules.\n
    Utilized engaging, kid-friendly approaches to present modules and educate on diverse topics, leading to a notable 45% increase in program retention rate, highlighting the successful adaptation of complex concepts for a young audience.\n
    Provided support to resolve emotional disruptions and conflicts among youth, resulting in a 50% decrease in behavioral incidents and contributing to a more conducive learning environment.`,
    tech: ["Scratch"],
  },
];
