# WPForms Collective Docs Style Guide

This document includes all the guidelines writers must follow when creating documentation for WPForms Collective. Its purpose is as follows:

1. To ensure our content supports our mission and reflects our values. As a reminder, Awesome Motive’s mission is to **empower people to succeed**. Our values are:

   * We **put people first**, always.  
   * We **do the right thing** every time.  
   * We fight for our **customer’s success**.  
   * We commit to **excellence** by paying **attention to details**.  
   * We labor for **simplicity**.

2. To foster the creation of high-quality content that grows our brand.  
3. To enforce brand consistency across our product sites.

| Note: In this document, “WPForms” refers to all products under our brand. “WPForms (the plugin)” will be used to differentiate any information that applies only to the form builder. |
| :---- |


## Voice and Tone

Unlike blog posts, docs should match voice and tone, so they all appear as if a singular author wrote them.

Docs should strive for a conversational tone and an appropriate level of detail to be thorough yet not overwhelming or too technical.

Additionally, our docs are *the* authority on how to use our plugins, and your writing should reflect this. Avoid using words like “could,” “would,” and “should.” Instead, show confidence through your language by telling the reader exactly what they need to do.

Never use em-dashes (—), forward slashes (/), and ampersands (&). 

* **Exception:** These characters are permitted when used in interface text (e.g., Zapier’s **Test & Continue** button, WP Mail SMTP mailers with 2 names).

Be wary of “you can” statements, as they may imply that a step is optional or that there are alternative methods of achieving the same result. It also sounds less confident to use “you can” when it’s not needed to clarify that there are multiple possible solutions.

* Less Ideal: “To connect your form to your marketing integration, you can fill out the settings in the **Marketing** section of the form builder.”  
* Better: “To connect your form to your marketing integration, fill out the settings in the **Marketing** section of the form builder.”


## Documentation Structure and Format

For SendLayer Glossary and Error Library docs and SendLayer Competitor pages, please also see the [SendLayer Special Docs Format Guidelines](https://docs.google.com/document/d/1e4cT7OAUwQCK1wUMmc08DHrts7yyR_ZBj-iJNGj3yIY/edit?usp=sharing).

All other docs should be in a consistent format. The general outline is as follows:

### Title

A clear and concise description of the doc’s goal. Use [AP Style](https://www.bkacontent.com/how-to-correctly-use-apa-style-title-case/) to determine which words should be capitalized.

* Make sure to capitalize “to be” verbs (is/are).

For readability, important words should be at the beginning of the title.

Doc titles should start with an \-ing verb.

* Examples: “Creating a Mailing List,” “Authorizing Your Domain”

* **Exception:** If an \-ing verb doesn’t make sense, use important words as close to the beginning of the title as you can. This will aid [eye-scanning](https://creativehandles.com/blog-posts/79/4-types-of-eye-tracking-patterns-how-people-don-t-read-on-web).

Comprehensive collections of topics can start with “A Complete Guide to.”

* Examples: “A Complete Guide to WP Mail SMTP Mailers,” “A Complete Guide to WPForms Settings”

WPForms addon doc titles should be the name of the addon.

* Examples: “Stripe Addon” “Geolocation Addon”

### Introduction

Introductions for WPForms (the plugin) is always 2 paragraphs and follow this structure:

* **Question:** Appeal to the reader’s motivation and give them a reason to keep reading.

* **Solution:** Give a short summary/teaser of how this doc will answer the reader’s question and benefit them.

* **Restate**: Use the main keyword and restate the title in this sentence. This should be its own paragraph.

* Example:  
  “Would you like to limit the number of words or characters that a user can enter into certain fields in your form? Long entries can be hard to review, and in some cases may not fit your goals for a form.

  “In this tutorial, we’ll show you how to easily restrict the length of Single Line Text and Paragraph Text fields.”


### Table of Contents

Unless the doc is super short, it should be broken down into sections. Each section heading will be listed in the Table of Contents, located directly under the doc introduction.

#### WPForms TOC

We use the **AIOSEO \- Table of Contents** block for the TOC in WPForms, WP Mail SMTP, and Easy WP SMTP docs. The Table of Contents should be added after the first paragraph or before the first heading.

After adding the TOC block, use the visibility icon to toggle off headings that need to be disabled in the TOC.

![][image3]

Typically, only the main headings should be shown in the TOC.

The TOC anchor links are usually prefixed with ‘aioseo’ followed by the heading title. Always check and update the anchor links to match the heading.

![][image4] 


### Requirements

We write all docs with the assumption that the reader has a paid license. If the doc requires the user to have a non-Basic license for WPForms or non-Pro license for WP Mail SMTP, however, then an alert needs to be added.

The minimum license level and other requirements should be shared in a yellow alert box. It should appear immediately after the Table of Contents.

![][image7]

In cases where you need to include multiple requirements, use your best judgment as to how to present all the relevant information. [Short requirements](https://wpforms.com/docs/testing-payments-with-the-paypal-commerce-addon/) (e.g., license level, 3rd party accounts) may be presented in an unordered list:

![][image8]

If a requirement may benefit from further explanation, it may be better for format it as a second paragraph:

![][image9]

Avoid using more than 2 paragraphs in one alert.

Additionally, license requirements for WPForms can be displayed using the \[wpf\_required\_addon\_disclaimer addon="ADDON" license="LICENSE"\]CTA shortcode in a Shortcode block. Replace the placeholder parameters with the addon and license level.

Add the shortcode at the very top of the doc:

![][image10]

The goal of this CTA is to encourage lite users to purchase the paid version of the plugin. Therefore, it should be used for all features available with a Basic+ subscription.

### Video

If a video has been created for the doc, it should be placed below the Requirements box and above the divider line using the YouTube embed block.

For details on how to embed a video, see the [Image and Media Guidelines](https://docs.google.com/document/d/1IH6oLbz_i1zXqDxe_b9j-wy4e2sd1RbsePuYzOmk4dc/edit?usp=sharing).

### Divider

Add a Separator block before the main body content of the doc.

### “Before you get started…”

If there are steps users must take before they can begin the tutorial in the doc, include a short paragraph or two before the first heading explaining what steps must be completed and linking to any relevant documentation.

* Example: “Before you get started, make sure to [install and activate the WPForms plugin](https://wpforms.com/docs/install-wpforms-plugin/) on your site and [verify your license](https://wpforms.com/docs/verify-wpforms-license/). Then [create a new form](https://wpforms.com/docs/creating-first-form/) or open an existing one for editing.”

| Note: This content is stored as a reusable block for SendLayer. |
| :---- |

### Headings

Docs headings start at H2 and descend from there as you add subsections.

Section headings for content where you are explaining an action readers must take should start with \-ing verbs.

* Examples: “Customizing Form Fields,” “Selecting a Form Template”

Section headings for content that lists features or settings can simply state what the section covers.

* Examples: “Smart Tags Available in WPForms,” “General Settings”

Most docs will not require you to explain the significance of the feature you’re writing about or to describe a particular product in detail. However, for the few cases where it is relevant, the headings for these sections should be phrased as questions.

* Example: “How Do WP Mail SMTP Mailers Fix Email Delivery Issues?”

For sequential steps, include a number at the beginning of each heading.

* Example: “1. Creating a New Form, 2\. Adding Fields to Your Form, 3\. Customizing Field Options, etc.”

Use [AP Style](https://www.bkacontent.com/how-to-correctly-use-apa-style-title-case/) to determine which words to capitalize.

### Frequently Asked Questions (FAQs)

Add FAQs using the block pattern as shown in [this video](https://a.supportally.com/v/Vn349A).

This section should include common or anticipated questions that don’t fit into the flow of the doc.

* Include a short lead-in after the FAQ heading and before the first question.

  * Example: “Below, we’ve addressed some of the most common questions regarding Stripe payments in WPForms.”

* Questions should be in sentence case and use the first person singular (I/me/my), as the reader would ask them.

* Questions should not be included in the Table of Contents.

* If you feel it’s necessary, you can include images in your answers.

### Conclusion

Do not add a heading for the conclusion. Just jump straight into it from the last paragraph of the final section or following the last FAQ answer.

Each doc’s conclusion should be two paragraphs. 

* The first will include a super quick summary of the doc’s goal (what the user should be able to accomplish now that they’re done with the doc). 

* The second shares a suggestion for what other doc they might find helpful.

* Example:  
  “That’s it\! You can now integrate Mailchimp with any form on your site.

  “Would you like to grow your subscriber list even further? Check out [our tutorial on leveraging lead magnets](https://wpforms.com/how-to-create-a-simple-lead-magnet-optin-form-in-wordpress/) to learn how you can offer potential subscribers incentives to subscribe to your mailing lists.”

For SendLayer, be sure to use the **Docs: Conclusion box (yellow)** reusable block. It should appear in a yellow alert box like so:

![][image11]

## Slug

The slug should always match the doc title, with hyphens instead of spaces.

However, *do not change the slug when updating a doc*, even if the title changes.

## Categories

Here are the doc categories currently in use on our sites. When choosing a category for a new doc (or proposing an existing doc be moved to a different category), keep this information in mind. 

We recommend looking through the docs in these categories to understand them better.

| Note: Do not use tags for docs. |
| :---- |

### WPForms (the Plugin)

* **Getting Started:** Core plugin functionality to get a basic form up and running.

* **Form Creation:** Guides on how to create specific types of forms, or how to use advanced form features such as conditional logic and Smart Tags.

* **Form Notifications:** Docs related to email notifications.

* **Entry Management:** How to view and manage entries.

* **Form Management:** Guides on using features such as form locator or form revisions.

* **Form Templates:** Using our premade form templates as well as custom form templates.

* **Field Types:** Guides on how to use or customize specific form fields.

* **Styling and Customization:** Customizing the appearance of forms.

* **Advanced Form Features:** Addons, fancy fields, and Smart Tags.

* **Field Customizations:** Explanations of field options.

* **Advanced Field Customizations:** Input masks, dynamic fields, and other advanced features for fields.

* **Other Addons:** Guides to using addons not included in other integrations categories.

* **Conversion Tools:** Addons that help improve conversions.

* **Marketing Integrations:** Addons for marketing tools.

* **Payment Forms:** How to create payment-related forms, such as order or donation forms.

* **Payment Processing:** Anything related to using payment addons (PayPal, Stripe, Square, Authorize.Net) or how to accept payments in a form.

* **Payment Management:** Guides on viewing and managing WPForms payment records in the WordPress dashboard. 

* **Spam Prevention and Security:** All spam-related features and integrations.

* **Account Management:** Anything related to billing or managing accounts.

* **Styling and Customization:** Customizing the appearance of forms.

* **Extending Functionality:** Integrations with other plugins and custom apps.

* **Troubleshooting and Support**: Common issues when using the plugin and how to address them.


## Product Terminology

Always refer to UI elements by their labels.

For transparency, refer to WPForms (the plugin), WP Mail SMTP, Easy WP SMTP, Sugar Calendar, and SendLayer as “our” products.

* Examples: 

  * “You can easily build a contact form for your site using WPForms, our form builder plugin.”

  * “If your contact form email notifications aren’t sending, check out our email delivery plugin, WP Mail SMTP.” 

  * “If you want to start improving your email delivery rate for free, try our transactional email delivery service, SendLayer.”

### License Terminology

To avoid confusion, use the following terminology to refer to our plugin versions and licenses.

* “Free version” and “Paid version”

* “Basic license,” “Plus license,” “Pro license,” or “Elite license”

**Never use the phrase “pro version.”** This causes the misconception that there is one free version and one paid version, instead of multiple license levels. Instead, either use the phrase “paid version” to refer to all license levels or refer to the specific license (e.g., “Basic license” or “Pro license”).

## Alerts

Alerts are additional information we want to draw attention to. We use the following color coding system for different levels of importance:

* **Blue**: Just a helpful tip, not vital knowledge to achieve the doc goal.

* **Yellow**: If the user doesn’t follow these instructions, something will likely not work quite as they intend. Also used for requirements for following the tutorial, such as a particular license level, a valid SSL certificate, etc.

* **Red**: If the user doesn’t follow these instructions, things will break or cause irreversible changes. 

Every alert should start with “Note:” in bold.

* Example: \[alert style="info"\]**Note:** All Mailchimp mailing lists must be created in your Mailchimp account. For more details, check out [Mailchimp's tutorial on getting started with lists](https://kb.mailchimp.com/lists/growth/getting-started-with-lists).\[/alert\]

  * **Exception:** When adding an alert to share requirements for completing the tutorial, the alert should start with “Requirements:” in bold.

    * Example: \[alert\]**Requirements:** In order to use the Stripe addon, you’ll need a Pro license level or higher.\[/alert\]

Do not stack 2 alerts on top of each other. If you need to include multiple notes in close proximity to one another, consider either combining them or spacing them throughout the section.

Try keeping alerts to a few sentences maximum. Consider incorporating the information into the main doc text if the alert requires more than a single paragraph.

### WPForms and WP Mail SMTP

Use the **Alert Box** block to add all alerts.  
![][image14]  
In the block settings, select the **Default** style for blue alerts, the **Warning Alert** style for yellow alerts, and the **Danger Alert** style for red alerts.

![][image15]


## SEO

SEO is not a priority for docs. If an article ranks well, that’s great, but it’s never the goal.

That said, there are still some SEO settings you must fill out for docs.

* **Meta description:** Every doc should have a meta description. This should be similar to the doc’s introduction—first, pose a question or state a problem the reader might have. Then summarize what the doc is about. Try to stick as close as possible to the character limit shown by the SEO plugin.

  * Example: “Would you like to choose which fields are displayed on your form's main Entries page? Here's how to quickly view the most important entry fields of a form.”

* **SEO title:** The SEO title should match the doc title exactly. Remove the separator and site title tags automatically added by SEO plugins.

SEO settings will be managed by AIOSEO.

## Archive Page Settings (SendLayer Only)

Each doc must be assigned an icon, which will appear above its title on the category archive page.

![][image20]

To select an icon, scroll to the bottom of the editor and choose from the dropdown menu. Use your best judgment and pick an icon that is clearly relevant to the content.

![][image21]

You do not need to add a title or description to this section—leave those settings blank. This information will be pulled from the doc automatically.