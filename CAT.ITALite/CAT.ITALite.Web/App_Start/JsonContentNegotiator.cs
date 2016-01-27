using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;

namespace CAT.ITALite.Web
{
    public class JsonContentNegotiator : IContentNegotiator
    {
        private JsonMediaTypeFormatter jsonFormatter;

        public JsonContentNegotiator(JsonMediaTypeFormatter jsonFormatter)
        {
            this.jsonFormatter = jsonFormatter;
        }

        public ContentNegotiationResult Negotiate(Type type, HttpRequestMessage request, IEnumerable<MediaTypeFormatter> formatters)
        {
            return new ContentNegotiationResult(this.jsonFormatter, new MediaTypeHeaderValue("application/json"));
        }
    }
}