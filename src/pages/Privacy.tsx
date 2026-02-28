const Privacy = () => {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold mb-6">Privacy Policy</h1>

      <p className="text-muted-foreground mb-4">
        GraphCareers respects your privacy. We collect only the information
        necessary to provide our services, such as your email address, skills,
        and career preferences.
      </p>

      <p className="text-muted-foreground mb-4">
        We do not sell or share your personal data with third parties, except
        when required to operate the service (for example, authentication or
        payments).
      </p>

      <p className="text-muted-foreground">
        If you have any questions about this policy, please contact us at{" "}
        <a
          href="mailto:support@graphcareers.com"
          className="underline underline-offset-4 hover:text-foreground"
        >
          support@graphcareers.com
        </a>.
      </p>
    </main>
  );
};

export default Privacy;