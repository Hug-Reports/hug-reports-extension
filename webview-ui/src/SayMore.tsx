import "./App.css";
import { useState, useRef, useEffect } from "react";
import {
  Button,
  Field,
  Textarea,
  Text,
  Tag,
  TagGroup,
  TagGroupProps,
  Divider,
  Dropdown,
  Combobox,
  Skeleton,
  SkeletonItem,
  MessageBar,
  MessageBarBody,
  Input,
  Option,
} from "@fluentui/react-components";
import { Edit16Filled, ArrowUndo16Filled } from "@fluentui/react-icons";
import type { ComboboxProps } from "@fluentui/react-components";
import { FaGithub, FaPython } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import { IoIosSave, IoLogoJavascript } from "react-icons/io";
import { Dismiss12Regular } from "@fluentui/react-icons";
import { BiMailSend } from "react-icons/bi";
const globals = require("./front-end-globals");
const BACKEND = globals.BACKEND;

const SayMore = ({ lineofcode }) => {
  const [selectedPackage, setSelectedPackage] = useState(
    lineofcode.modules.map((item, index) => ({ value: index, child: item.packageName }))
  );
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [fetchedURL, setFetchedURL] = useState(false);
  const [editURL, setEditURL] = useState(false);
  const [editableURL, setEditableURL] = useState("");
  const inputRef = useRef(null);
  const contributeRef = useRef(null);

  const removeItem: TagGroupProps["onDismiss"] = (_e, { value }) => {
    setSelectedPackage([...selectedPackage].filter((tag) => tag.value !== value));
  };

  const handleRemoveContributedLink = () => {
    if (lineofcode.language == "python") {
      setEditableURL(
        "We were unable to find the GitHub URL for this package from the Python Package Index."
      );
    } else if (lineofcode.language == "javascript") {
      setEditableURL(
        "We were unable to find the GitHub URL for this package from the npm registry."
      );
    }
  };

  //define an async function
  const fetchGithubUrl = async (packagename) => {
    const linkResponse = await fetch(`http://${BACKEND}/getGithub`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        packageName: packagename,
        language: lineofcode.language,
      }),
    });
    const { url } = await linkResponse.json();
    setGithubUrl(url);
  };

  useEffect(() => {
    if (githubUrl !== "") {
      setFetchedURL(true);
      if (githubUrl === "No GitHub URL found") {
        if (lineofcode.language == "python") {
          setEditableURL(
            "We were unable to find the GitHub URL for this package from the Python Package Index."
          );
        } else if (lineofcode.language == "javascript") {
          setEditableURL(
            "We were unable to find the GitHub URL for this package from the npm registry."
          );
        }
      } else {
        setEditableURL(githubUrl);
      }
    }
  }, [githubUrl]);

  useEffect(() => {
    if (editURL) {
      if (githubUrl !== "No GitHub URL found") {
        inputRef.current.focus();
      } else {
        contributeRef.current.focus();
      }
    }
  }, [editURL]);

  useEffect(() => {
    if (selectedPackage.length === 1) {
      //get value for the selected package
      const selectedPackageModules = lineofcode.modules[selectedPackage[0].value].modules;
      setDropdownOptions([
        { searchModules: "", identifier: "thank entire package" },
        ...selectedPackageModules,
      ]);
      fetchGithubUrl(selectedPackage[0].child);
    }
  }, [selectedPackage]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {lineofcode.language === "python" && <FaPython />}
        {lineofcode.language === "javascript" && <IoLogoJavascript />}
        <h6 style={{ marginLeft: "10px" }}>PACKAGE:</h6>
      </div>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", marginTop: 0 }}>
        {selectedPackage.length > 1 && (
          <TagGroup onDismiss={removeItem} aria-label="Dismiss example">
            {selectedPackage.map((tag, index) => (
              <Tag
                dismissible
                dismissIcon={{ "aria-label": "remove" }}
                value={tag.value}
                key={tag.value}>
                {tag.child}
              </Tag>
            ))}
          </TagGroup>
        )}
        {selectedPackage.length == 1 && (
          <TagGroup>
            {selectedPackage.map((tag, index) => (
              <Tag value={tag.value} key={tag.value}>
                {tag.child}
              </Tag>
            ))}
          </TagGroup>
        )}
      </div>
      {selectedPackage.length > 1 && (
        <div style={{ marginTop: "1rem" }}>
          <Text size={100}>
            <em>Retain one to proceed</em>
          </Text>
        </div>
      )}
      <div style={{ width: "100%", marginTop: "1rem" }}>
        {dropdownOptions.length > 0 && (
          <div>
            <Dropdown
              multiselect={true}
              disabled={editURL}
              placeholder="Select the modules you want to thank"
              style={{ width: "100%" }}>
              {dropdownOptions.map((option) => (
                <Option key={option.searchModules}>{option.identifier}</Option>
              ))}
            </Dropdown>
            <Divider style={{ marginTop: "2rem" }} inset />
          </div>
        )}
        {selectedPackage.length === 1 &&
          (fetchedURL == true ? (
            githubUrl !== "No GitHub URL found" ? (
              <div>
                <div style={{ display: "flex" }}>
                  <div
                    style={{ flex: 6, display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <FaGithub />
                    <h6 style={{ marginLeft: "10px" }}>REPOSITORY:</h6>
                  </div>
                  <div style={{ flex: 4, display: "flex", alignItems: "center" }}>
                    <Text size={100}>
                      <em>Doesn't look right?</em>
                    </Text>
                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <div
                    style={{ flex: 6, display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <Input
                      size="small"
                      style={{ width: "100%" }}
                      value={editableURL}
                      readOnly={!editURL}
                      ref={inputRef}
                      onChange={(e) => {
                        setEditableURL(e.target.value);
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                    {!editURL && (
                      <Button
                        size="small"
                        icon={<MdOutlineEdit />}
                        style={{ marginRight: "5px" }}
                        onClick={() => {
                          setEditURL(!editURL);
                        }}>
                        Edit
                      </Button>
                    )}
                    {editURL && (
                      <Button
                        size="small"
                        icon={<IoIosSave />}
                        style={{ marginRight: "5px" }}
                        onClick={() => {
                          setEditURL(!editURL);
                        }}>
                        Save
                      </Button>
                    )}
                    <Button
                      disabled={editURL || editableURL === githubUrl}
                      size="small"
                      icon={<ArrowUndo16Filled />}
                      onClick={() => {
                        setEditableURL(githubUrl);
                      }}>
                      Revert
                    </Button>
                  </div>
                </div>
                {editURL && (
                  <MessageBar intent="warning" style={{ marginTop: "10px" }}>
                    <MessageBarBody style={{ fontSize: "10px" }}>
                      Must click "Save" to continue. To remove your changes click "Save" and then
                      click "Revert".
                    </MessageBarBody>
                  </MessageBar>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex" }}>
                  <div
                    style={{ flex: 5, display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <FaGithub />
                    <h6 style={{ marginLeft: "10px" }}>REPOSITORY:</h6>
                  </div>
                  <div style={{ flex: 5, display: "flex", alignItems: "center" }}>
                    <Text size={100}>
                      <em>Have a minute to find and add the Github repository?</em>
                    </Text>
                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <div
                    style={{ flex: 5, display: "flex", alignItems: "center", marginRight: "10px" }}>
                    <Input
                      size="small"
                      style={{ width: "100%" }}
                      value={editableURL}
                      readOnly={!editURL}
                      ref={contributeRef}
                      onChange={(e) => {
                        setEditableURL(e.target.value);
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                    {!editURL && (
                      <Button
                        size="small"
                        icon={<MdOutlineEdit />}
                        style={{ marginRight: "5px" }}
                        onClick={() => {
                          setEditURL(!editURL);
                          setEditableURL("");
                        }}>
                        Contribute
                      </Button>
                    )}
                    {editURL && (
                      <Button
                        size="small"
                        icon={<IoIosSave />}
                        style={{ marginRight: "5px" }}
                        onClick={() => {
                          setEditURL(!editURL);
                          if (editableURL === "") {
                            handleRemoveContributedLink();
                          }
                        }}>
                        Save
                      </Button>
                    )}
                    <Button
                      disabled={
                        editURL ||
                        editableURL ===
                          "We were unable to find the GitHub URL for this package from the Python Package Index." ||
                        editableURL ===
                          "We were unable to find the GitHub URL for this package from the npm registry."
                      }
                      size="small"
                      icon={<ArrowUndo16Filled />}
                      onClick={handleRemoveContributedLink}>
                      Remove
                    </Button>
                  </div>
                </div>
                {editURL && (
                  <div>
                    <div style={{ display: "flex", marginTop: "10px" }}>
                      <div style={{ flex: 6, display: "flex", alignItems: "center" }}>
                        {lineofcode.language === "python" && (
                          <Text size={100}>
                            <em>
                              URL should have format:
                              https://github.com/&#123;owner&#125;/&#123;repo&#125;<br></br>Example:
                              https://github.com/pandas-dev/pandas
                            </em>
                          </Text>
                        )}
                        {lineofcode.language === "javascript" && (
                          <Text size={100}>
                            <em>
                              URL should have format:
                              https://github.com/&#123;owner&#125;/&#123;repo&#125;<br></br>Example:
                              https://github.com/facebook/react
                            </em>
                          </Text>
                        )}
                      </div>
                      <div style={{ flex: 4 }}></div>
                    </div>
                    <MessageBar intent="warning" style={{ marginTop: "10px" }}>
                      <MessageBarBody style={{ fontSize: "10px" }}>
                        Must click "Save" to continue. To remove your changes click "Save" and then
                        click "Remove".
                      </MessageBarBody>
                    </MessageBar>
                  </div>
                )}
                <div style={{ marginTop: "1rem" }}>
                  {lineofcode.language == "python" && (
                    <Text size={100}>
                      <em>
                        We retrieve GitHub links for the package using the Python Package Index
                        (PyPI) and user contributions. We did not find a link to the repository for
                        this package on PyPI or in user contributed links. We will find the link
                        manually after your message is submitted. You can help us by locating and
                        addding a link to the GitHub repository for the package. These will still be
                        manually verified by our team before thanks are sent.
                      </em>
                    </Text>
                  )}
                  {lineofcode.language == "javascript" && (
                    <Text size={100}>
                      <em>
                        We retrieve GitHub links for the package using the npm registry and user
                        contributions. We did not find a link to the repository for this package on
                        the npm registry or in user contributed links. We will find the link
                        manually after your message is submitted. You can help us by locating and
                        addding a link to the GitHub repository for the package. These will still be
                        manually verified by our team before thanks are sent.
                      </em>
                    </Text>
                  )}
                </div>
              </div>
            )
          ) : (
            <Skeleton style={{ marginTop: "1rem" }}>
              <SkeletonItem />
            </Skeleton>
          ))}
        <Divider style={{ marginTop: "2rem" }} inset />
        {selectedPackage.length === 1 && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* <FaPython /> */}
              <h6 style={{ marginLeft: "0" }}>HUG REPORT:</h6>
            </div>
            <div>
              <Field size="small" label="What are you using this package for?">
                <Textarea resize="none" disabled={editURL} />
              </Field>
              <Field
                size="small"
                label="What about this package did you find helpful?"
                style={{ marginTop: "10px" }}>
                <Textarea resize="none" disabled={editURL} />
              </Field>
              <Field size="small" label="Anything else?" style={{ marginTop: "10px" }}>
                <Textarea resize="none" disabled={editURL} />
              </Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
              <Button size="small" icon={<BiMailSend />} disabled={editURL}>
                Send Hug Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SayMore;
