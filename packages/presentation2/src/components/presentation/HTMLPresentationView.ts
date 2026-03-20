import { HTMLSectionView } from "../section/HTMLSectionView";
import { PresentationConnection } from "./PresentationView";
import { Presentation } from "./Presentation";

export class HTMLPresentationViewInner {
  private presentation_: Presentation;
  private connection_: PresentationConnection;

  private sections_: HTMLSectionView[];

  constructor(options: {
    presentation: Presentation;
    connection: PresentationConnection;
  }) {
    this.presentation_ = options.presentation;
    this.connection_ = options.connection;

    this.sections_ = this.presentation_.sections.map((section) => {
      return new HTMLSectionView({ presentationView: this, section: section });
    });
  }

  get presentation(): Presentation {
    return this.presentation_;
  }

  get connection(): PresentationConnection {
    return this.connection_;
  }

  get sections(): readonly HTMLSectionView[] {
    return this.sections_;
  }

  createDOM(): void {
    this.sections_.forEach((section) => {
      section.createDOM();
    });
  }

  layout(): void {
    this.sections_.forEach((section) => {
      section.layout();
    });
  }
}

export class HTMLPresentationView {
  private pImpl_: HTMLPresentationViewInner | null = null;

  constructor(options: { presentation: Presentation }) {
    options.presentation.attachView({
      connect: (connection: PresentationConnection) => {
        if (this.pImpl_) {
          throw new Error("Already connected");
        }

        this.pImpl_ = new HTMLPresentationViewInner({
          presentation: options.presentation,
          connection: connection,
        });
      },

      disconnect: () => {
        if (!this.pImpl_) {
          throw new Error("Not connected");
        }

        this.pImpl_ = null;
      },
    });
  }
}
