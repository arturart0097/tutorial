type SectionCardProps = {
  children: React.ReactNode;
  title: string;
  collapsed: boolean;
  onCollapseToggle: (state: boolean) => void;
};

export default function SectionCard({
  children,
  title,
  collapsed,
  onCollapseToggle,
}: SectionCardProps) {
  return (
    <div className="section ">
      <div className="title-row">
        <div className="title">{title}</div>
        <div className="caret-icon-wrapper">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onCollapseToggle(!collapsed);
            }}
          >
            {collapsed ? (
              <svg
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.5 6L8.5 10L12.5 6"
                  stroke="#FAFAFA"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 10L8.5 6L4.5 10"
                  stroke="#FAFAFA"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </a>
        </div>
      </div>

      {collapsed ? null : <div className="content">{children}</div>}
    </div>
  );
}
