
// ============================================================
// AI RESUME ANALYZER
// PDF TEXT EXTRACTION SERVICE
// ============================================================
//
// Responsibilities:
//
// 1. Read uploaded PDF
// 2. Validate PDF buffer
// 3. Extract text using pdf-parse
// 4. Clean extracted text
// 5. Return usable resume text
//
// ============================================================

const fs = require("fs");
const pdfParse = require("pdf-parse");

// ============================================================
// EXTRACT TEXT FROM PDF
// ============================================================

const extractTextFromPDF =
  async (
    filePath
  ) => {
    try {
      console.log(
        "\n=============================="
      );

      console.log(
        "PDF TEXT EXTRACTION"
      );

      console.log(
        "=============================="
      );

      // ========================================================
      // 1. CHECK FILE PATH
      // ========================================================

      if (
        !filePath
      ) {
        throw new Error(
          "PDF file path is missing."
        );
      }

      console.log(
        "PDF Path:",
        filePath
      );

      // ========================================================
      // 2. CHECK FILE EXISTS
      // ========================================================

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        throw new Error(
          `PDF file not found: ${filePath}`
        );
      }

      // ========================================================
      // 3. FILE INFORMATION
      // ========================================================

      const fileStats =
        fs.statSync(
          filePath
        );

      if (
        !fileStats.isFile()
      ) {
        throw new Error(
          "The uploaded PDF path does not point to a valid file."
        );
      }

      console.log(
        "PDF Size:",
        fileStats.size,
        "bytes"
      );

      if (
        fileStats.size <=
        0
      ) {
        throw new Error(
          "Uploaded PDF file is empty."
        );
      }

      // ========================================================
      // 4. READ PDF BUFFER
      // ========================================================

      console.log(
        "Reading PDF..."
      );

      const dataBuffer =
        await fs.promises.readFile(
          filePath
        );

      console.log(
        "PDF file read successfully."
      );

      // ========================================================
      // 5. BASIC PDF VALIDATION
      // ========================================================
      //
      // Standard PDF files begin with:
      //
      // %PDF-
      //
      // ========================================================

      const pdfHeader =
        dataBuffer
          .subarray(
            0,
            5
          )
          .toString(
            "ascii"
          );

      console.log(
        "PDF Header:",
        pdfHeader
      );

      if (
        pdfHeader !==
        "%PDF-"
      ) {
        throw new Error(
          "Invalid PDF file. The uploaded file does not contain a valid PDF header."
        );
      }

      // ========================================================
      // 6. PARSE PDF
      // ========================================================

      console.log(
        "Parsing PDF..."
      );

      let data;

      try {
        data =
          await pdfParse(
            dataBuffer
          );
      } catch (
        parseError
      ) {
        console.error(
          "\n=============================="
        );

        console.error(
          "PDF PARSING FAILED"
        );

        console.error(
          "=============================="
        );

        console.error(
          "Error Name:",
          parseError?.name
        );

        console.error(
          "Error Message:",
          parseError?.message
        );

        console.error(
          "==============================\n"
        );

        const parseMessage =
          String(
            parseError?.message ||
              ""
          ).toLowerCase();

        // ------------------------------------------------------
        // Common corrupted XRef issue
        // ------------------------------------------------------

        if (
          parseMessage.includes(
            "bad xref"
          )
        ) {
          throw new Error(
            "This PDF has an invalid or corrupted internal XRef structure and could not be parsed. Please re-save the PDF using Print to PDF or upload another PDF."
          );
        }

        // ------------------------------------------------------
        // Generic parse failure
        // ------------------------------------------------------

        throw new Error(
          parseError?.message ||
            "Unable to parse the uploaded PDF."
        );
      }

      // ========================================================
      // 7. EXTRACT TEXT
      // ========================================================

      let extractedText =
        typeof data?.text ===
        "string"
          ? data.text
          : "";

      // ========================================================
      // 8. CLEAN TEXT
      // ========================================================

      extractedText =
        extractedText
          .replace(
            /\r\n/g,
            "\n"
          )
          .replace(
            /\r/g,
            "\n"
          )
          .replace(
            /[ \t]+/g,
            " "
          )
          .replace(
            /\n[ \t]+/g,
            "\n"
          )
          .replace(
            /\n{3,}/g,
            "\n\n"
          )
          .trim();

      // ========================================================
      // 9. CHECK EXTRACTED TEXT
      // ========================================================

      if (
        !extractedText
      ) {
        console.error(
          "PDF parsed but no readable text was extracted."
        );

        const error =
          new Error(
            "PDF was opened successfully, but no readable text could be extracted. The PDF may be image-based or scanned."
          );

        error.statusCode =
          422;

        throw error;
      }

      // ========================================================
      // 10. LOG RESULT
      // ========================================================

      console.log(
        "\n=============================="
      );

      console.log(
        "PDF PARSED SUCCESSFULLY"
      );

      console.log(
        "=============================="
      );

      console.log(
        "Pages:",
        data?.numpages ||
          "Unknown"
      );

      console.log(
        "Extracted Characters:",
        extractedText.length
      );

      console.log(
        "==============================\n"
      );

      // ========================================================
      // 11. RETURN TEXT
      // ========================================================

      return extractedText;
    } catch (
      error
    ) {
      console.error(
        "\n================================================"
      );

      console.error(
        "             PDF EXTRACTION ERROR"
      );

      console.error(
        "================================================"
      );

      console.error(
        "File:",
        filePath
      );

      console.error(
        "Error:",
        error?.message ||
          error
      );

      console.error(
        "================================================\n"
      );

      throw error;
    }
  };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  extractTextFromPDF,
};
