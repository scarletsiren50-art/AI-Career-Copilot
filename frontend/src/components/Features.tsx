function Features() {
    const features = [
    {
        icon: "📄",
        title: "Resume Analysis",
        description: "Get an AI-powered analysis of your resume, including strengths, weaknesses, and improvement suggestions.",
    },
    {
        icon: "🎯",
        title: "Job Matching",
        description: "Compare your resume against job descriptions and understand how well your profile matches the role.",
    },
    {
        icon: "🧠",
        title: "Skill Gap Analysis",
        description: "Discover the skills you're missing and get personalized recommendations for becoming job-ready.",
    },
    {
        icon: "🎤",
        title: "Interview Preparation",
        description: "Practice role-specific interview questions and prepare with AI-generated feedback and recommendations.",
    },
];

return (
        <section className="features-section" id="features">
            <div className="features-header">
                <p className="section-eyebrow">YOUR CAREER, INTELLIGENTLY GUIDED</p>

                <h2>Everything you need to move forward.</h2>

                <p>
                    From your first resume upload to your next interview, Career Copilot helps you make smarter career decisions.
                </p>
            </div>

            <div className="features-grid">
                {features.map((feature) => (
                    <div className="feature-card" key={feature.title}>
                        <div className="feature-icon">{feature.icon}</div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Features;