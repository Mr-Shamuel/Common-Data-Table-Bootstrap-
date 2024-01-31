   <Card className="mt-3">
        <Card.Body>
          {isloading ? (
            <CommonLoading />
          ) : (
            <>
              {tableData?.length !== 0 ? (
                <CommonTable
                  DATATABLE={tableData}
                  COLUMNS={tableColumn}
                  FILENAME="Progress"
                  downloadFile={showOrganogramReport}
                  reportType="ORGANOGRAM-ASSESSMENT-REPORT"
                  filter={false}
                  sortBy={false}
                  pagination={true}
                />
              ) : (
                <div>
                  <ul style={{ color: "#3C21F7" }}>
                    <li className="text-size-20 py-2">
                      সকল প্রকার প্রতিবেদন দেখার জন্য অনুগ্রহপূর্বক ফিল্টার
                      ব্যবহার করুন।
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
