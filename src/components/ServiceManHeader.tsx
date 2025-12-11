const ServiceManHeader = ({ title }: { title: string }) => {
  return (
    <>
      <div className="fixed_header">
        <div className="row">
          <div className="col-12 d-flex justify-content-center">
            <h1 className="head4">{title}</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceManHeader;
