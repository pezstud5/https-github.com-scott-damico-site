const workItems = [
  {
    title: 'AI Mentor Simulations',
    hook: 'Practice judgment before the stakes are real.',
    description:
      'Scenario-based mentoring experiences that help learners make choices, reflect on tradeoffs, and improve how they reason through uncertainty.',
  },
  {
    title: 'Gamified Government Courses',
    hook: 'Civics made active, competitive, and memorable.',
    description:
      'Political science learning experiences that use role play, missions, and structured challenge to make institutions and public choices feel concrete.',
  },
  {
    title: 'Faculty Development Workshops',
    hook: 'Professional learning that survives Monday morning.',
    description:
      'Hands-on sessions for faculty who need practical strategies for engagement, assessment, course design, and student persistence.',
  },
  {
    title: 'Leadership Programs',
    hook: 'Better teams through clearer habits and shared language.',
    description:
      'Programs grounded in Crucial Teams, The 7 Habits, and FourSight that help leaders communicate clearly, solve problems creatively, and build stronger teams.',
  },
];

export default function Work() {
  return (
    <section className="work section-shell" id="work">
      <div className="section-heading">
        <p className="section-number">02</p>
        <h2>What I Build</h2>
      </div>
      <div className="work-list">
        {workItems.map((item) => (
          <article className="work-item" key={item.title}>
            <h3>{item.title}</h3>
            <p className="work-hook">{item.hook}</p>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
