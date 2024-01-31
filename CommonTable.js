import React from "react";
import {Button} from "react-bootstrap";
import generateExcel from "zipcelx";
import html2pdf from "html2pdf.js";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import { useTranslation } from "react-i18next";
import { GlobalFilter } from "./GlobalFilter";
import ConvertEnStringToBnString from "../CommonFunctions/ConvertEnStringToBnString";

export const CommonTable = (props) => {
  const {
    FILENAME,
    PdfHeader,
    COLUMNS,
    DATATABLE,
    downloadFile,
    filter,
    add,
    btnAction,
    btnTitle,
    sortBy,
    pagination,
    reportType
  } = props;

  const { t, i18n } = useTranslation();
  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: DATATABLE,
      initialState: {
        pageSize: 30,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps, // table props from react-table
    headerGroups, // headerGroups, if your table has groupings
    getTableBodyProps, // table body props from react-table
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
    state,
    setGlobalFilter,
    page, // use, page or rows
    rows,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
  } = tableInstance;
  const { globalFilter, pageIndex, pageSize } = state;

  function getHeader(column) {
    if (column.totalVisibleHeaderCount === 1) {
      return [
        {
          value: column.Header,
          type: "string",
        },
      ];
    } else {
      const span = [...Array(column.totalVisibleHeaderCount - 1)].map((x) => ({
        value: "",
        type: "string",
      }));
      return [
        {
          value: column.Header,
          type: "string",
        },
        ...span,
      ];
    }
  }

  const exportData = (format) => {
    let fileName = FILENAME || "table-data";

    // Download Excel
    const getExcel = () => {
      const config = {
        filename: fileName,
        sheet: {
          data: [],
        },
      };
      const dataSet = config.sheet.data;

      // review with one level nested config
      // HEADERS
      headerGroups.forEach((headerGroup) => {
        const headerRow = [];
        if (headerGroup.headers) {
          headerGroup.headers.forEach((column) => {
            headerRow.push(...getHeader(column));
          });
        }
        const filteredHeaderRow = headerRow.filter((row) => {
          return row.value !== "Action" && typeof row.value !== "object";
        });
        dataSet.push(filteredHeaderRow);
      });

      // FILTERED ROWS
      rows.forEach((row) => {
        const dataRow = [];
        Object.values(row.values).forEach((value) =>
          dataRow.push({
            value,
            type: typeof value === "number" ? "number" : "string",
          })
        );
        const filteredDataRow = dataRow.filter((row) => {
          return (
            typeof row.value !== "object" && typeof row.value !== "undefined"
          );
        });
        dataSet.push(filteredDataRow);
      });
      return generateExcel(config);
    };

    // Download PDF
    const getPdf = () => {
      const tableHeaders = headerGroups[0].headers.map(
        (header) => header.Header
      );
      const filteredTableHeaders = tableHeaders.filter((header) => {
        return header !== "Action" && typeof header !== "object";
      });

      const tableRows = rows.map((row) => Object.values(row.values));
      const filteredTableRows = tableRows.map((row) =>
        row.filter((item) => {
          return typeof item !== "object" && typeof item !== "undefined";
        })
      );

      const tableHtml = `
      <style>
      div{
        margin:100px;
      }
        h3 {
          text-align: center;
          padding: 10px;
          font-weight: bolder;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          padding: 10px;
          border: 1px solid black;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
      <div> 

      <h3>${PdfHeader} অর্থবছরের সূচকওয়ারী অগ্রগতি </h3>
      <table>
        <thead>
          <tr>${filteredTableHeaders
            .map((header) => `<th>${header}</th>`)
            .join("")}</tr>
        </thead>
        <tbody>
          ${filteredTableRows
            .map(
              (row) =>
                `<tr>${row.map((item) => `<td>${item}</td>`).join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
      </div>
    `;

      const element = document.createElement("div");
      element.innerHTML = tableHtml;
      const pageSize = { width: 1224, height: 1584 };

      html2pdf(element, {
        margin: 1,
        filename: `${fileName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { dpi: 192, letterRendering: true },
        jsPDF: {
          unit: "px",
          format: [pageSize.width, pageSize.height],
          orientation: "landscape",
        },
      });
    };

    if (format === "xlsx") {
      getExcel();
    } else {
      getPdf();
    }
  };

  return (
    <div className="card table-responsive">
      <div className="d-flex justify-content-end gap-1">
        {sortBy && (
          <select
            className="selectpage border mb-2"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[30, 50, 100,200].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {t("CommonTable.Show")} { i18n.language === "en" ? pageSize:ConvertEnStringToBnString(pageSize)}
              </option>
            ))}
          </select>
        )}

        {filter && (
          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
        )}

        {downloadFile && (
          <div className="d-flex gap-1 mb-2">
            <Button
              variant="none"
              className="btn btn-sm btn-primary d-inline d-block"
              onClick={() => exportData("xlsx")}
            >
              {"এক্সেল"} <i className="fas fa-download ms-1"></i>
            </Button>
            <Button
              variant="none"
              className="btn btn-sm btn-info d-inline d-block"
              onClick={() => exportData("pdf")}
            >
              {"পিডিএফ"} <i className="fas fa-download ms-1"></i>
            </Button>
          </div>
        )}

        {add && (
          <Button
            className="btn btn-sm btn-light-success mb-2 fw-bold"
            onClick={btnAction}
          >
            {btnTitle} <i className="fa fa-plus"></i>
          </Button>
        )}
      </div>

      <table {...getTableProps()} className="table table-hover mb-0">
        <thead
          className="text-start tableBorder"
          style={{
            background:
              "linear-gradient( 98.18deg, rgba(234, 0, 185, 0.1) 0%, rgba(255, 184, 1, 0.1) 100% )",
          }}
        >
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={`${column.className} tableBorder`}
                >
                  <span className="tabletitle">{column.render("Header")}</span>
                  <span>
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <i className="fa fa-angle-down"></i>
                      ) : (
                        <i className="fa fa-angle-up"></i>
                      )
                    ) : (
                      ""
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="">
          {DATATABLE?.length !== 0 ? (
            page.map((row) => {
              prepareRow(row);
              return (
                <tr className="text-start" {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td
                        className={`${cell?.column?.className} borderrigth`}
                        {...cell.getCellProps()}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            // <div className="text-center w-100">তথ্য পাওয়া যায়নি...</div>
            <tr className="text-center">
              <td className="text-center borderrigth" colSpan={COLUMNS?.length}>
                তথ্য পাওয়া যায়নি...
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && DATATABLE?.length !== 0 && (
        <div className="d-block d-sm-flex mt-4 ">
          <span className="">
            {t(`CommonTable.Pages.Page`)}{" "}
            {i18n.language === "en" ? (
              <strong>
                {pageOptions.length} {t(`CommonTable.Pages.of`)} {pageIndex + 1}
              </strong>
            ) : (
              <strong>
                {ConvertEnStringToBnString(pageOptions.length)}{" "}
                {t(`CommonTable.Pages.of`)}{" "}
                {ConvertEnStringToBnString(pageIndex + 1)}
              </strong>
            )}
          </span>

          <span className="ms-sm-auto ">
            <Button
              variant=""
              className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              {/* previous page  */}
              {t("CommonTable.Previous")}
            </Button>
            <Button
              variant=""
              className="btn-default tablebutton me-2 my-1"
              onClick={() => {
                previousPage();
              }}
              disabled={!canPreviousPage}
            >
              {" << "}
            </Button>
            <Button
              variant=""
              className="btn-default tablebutton me-2 my-1"
              onClick={() => {
                previousPage();
              }}
              disabled={!canPreviousPage}
            >
              {" < "}
            </Button>
            <Button
              variant=""
              className="btn-default tablebutton me-2 my-1"
              onClick={() => {
                nextPage();
              }}
              disabled={!canNextPage}
            >
              {" > "}
            </Button>
            <Button
              variant=""
              className="btn-default tablebutton me-2 my-1"
              onClick={() => {
                nextPage();
              }}
              disabled={!canNextPage}
            >
              {" >> "}
            </Button>
            <Button
              variant=""
              className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {t("CommonTable.Next")}
            </Button>
          </span>
        </div>
      )}
    </div>
  );
};
