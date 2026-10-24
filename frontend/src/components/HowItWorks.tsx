function HowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Upload your resume",
            description: "Upload your resume and let Career Copilot understand your skills, experience, education, and career profile.",
        },
        {
            number: "02",
            title: "Analyze your profile",
            description: "Our AI analyzes your profile to identify strengths, missing skills, and areas that can be improved.",
        },
        {
            number: "03",
            title: "Match with opportunities",
            description: "Compare your profile with relevant job descriptions and understand how well you match each opportunity.",
        },
        {
            number: "04",
            title: "Build your career roadmap",
            description: "Get personalized recommendations for skills, projects, interview preparation, and your next career steps.",
        },
    ];

    return (
        <section className="how-it-works" id="how-it-works">
            <div className="how-it-works-header">
                <p className="section-eyebrow">HOW IT WORKS</p>
                <h2>From resume to <br /> career-ready.</h2>

                <p>Career Copilot turns your existing profile into a clear, actionable career plan.</p>
            </div>

            <div className="step-container">
                {steps.map((step) => (
                    <div className="step" key={step.number} data-number={step.number}>
                        <div className="step-number">{step.number}</div>
                        <div className="step-content">
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default HowItWorks;