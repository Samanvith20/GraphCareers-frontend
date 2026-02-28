const Contact = () => {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold mb-6">Contact Us</h1>

      <p className="text-muted-foreground mb-4">
        We’d love to hear from you. For any questions, issues, or feedback,
        please reach out to us.
      </p>

      <div className="mt-6 space-y-2 text-muted-foreground">
        <p>
          Email:{" "}
          <a
            href="mailto:support@graphcareers.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            support@graphcareers.com
          </a>
        </p>
        <p>Location: India</p>
      </div>
    </main>
  );
};

export default Contact;