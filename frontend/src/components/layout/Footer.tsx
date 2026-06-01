export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <div>© {new Date().getFullYear()} NyayaGPT · Informational use only</div>
        <div>Built on retrieval-augmented generation</div>
      </div>
    </footer>
  );
}
