import { Wrench } from "lucide-react";

function ModulePage({ title, description }) {
    return (
        <main className="module-page">
            <section className="module-header">
                <div>
                    <span className="module-label">DR. CAR CARE</span>

                    <h1>{title}</h1>

                    <p>{description}</p>
                </div>

                <div className="module-icon">
                    <Wrench size={26} />
                </div>
            </section>

            <section className="module-placeholder">
                <div className="module-placeholder-icon">
                    <Wrench size={32} />
                </div>

                <h2>{title}</h2>

                <p>
                    This module is ready for development.
                    The frontend will be connected to the Spring Boot
                    backend during the implementation phase.
                </p>
            </section>
        </main>
    );
}

export default ModulePage;